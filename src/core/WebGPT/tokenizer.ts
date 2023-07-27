import { fetchJson, fetchText } from "./fetch";

export class Tokenizer {
  encoder?: Record<string, number>;
  decoder?: Record<number, string>;
  vocab_size?: number;

  constructor() {}

  async load() {
    throw new Error("Not implemented.");
  }

  getVocabSize() {
    return this.vocab_size;
  }

  encode(str: string): number[] {
    throw new Error("Not implemented.");
  }

  decode(arr: number[]): string {
    throw new Error("Not implemented.");
  }
}

// ------------------ GPT Tokenizer ------------------
// Credit to https://github.com/latitudegames/GPT-3-Encoder

export class GPT2Tokenizer extends Tokenizer {
  pat: RegExp;
  textEncoder: TextEncoder;
  textDecoder: TextDecoder;
  byte_encoder?: Record<number, string>;
  byte_decoder?: Record<string, string>;
  bpe_ranks?: Record<string, number>;
  cache?: Map<string, string>;

  constructor() {
    super();
    this.pat =
      /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
    this.textEncoder = new TextEncoder(); // always utf-8 by spec
    this.textDecoder = new TextDecoder("utf-8");
  }

  async load() {
    // console.log("Loading GPT2 tokenizer...");

    const bpe_file = await fetchText("tokenization/vocab.bpe");
    const encoder = (await fetchJson("tokenization/gpt_tokens.json")) as Record<
      string,
      number
    >;
    this.encoder = encoder;

    // console.log("Building decoder...");
    const decoder: Record<number, string> = {};
    Object.keys(encoder).map((x) => {
      decoder[encoder[x]] = x;
    });
    this.decoder = decoder;

    const lines = bpe_file.split("\n");
    const bpe_merges = lines.slice(1, lines.length - 1).map((x) => {
      return x.split(/(\s+)/).filter(function (e) {
        return e.trim().length > 0;
      });
    });

    const byte_encoder = bytes_to_unicode();
    const byte_decoder: Record<string, string> = {};
    Object.keys(byte_encoder).map((x) => {
      byte_decoder[byte_encoder[x as any]] = x;
    });
    this.byte_encoder = byte_encoder;
    this.byte_decoder = byte_decoder;

    this.bpe_ranks = dictZip(
      bpe_merges as unknown as string[],
      range(0, bpe_merges.length),
    );
    this.cache = new Map();
    this.vocab_size = Object.keys(encoder).length;
  }

  encode(text: string) {
    if (!this.byte_encoder || !this.encoder) {
      throw new Error("Tokenizer not loaded.");
    }
    let bpe_tokens: number[] = [];
    const matches = Array.from(text.matchAll(this.pat)).map((x) => x[0]);
    for (let token of matches) {
      const encoded_bytes = this.textEncoder.encode(token);
      let bytes = [];
      for (let i = 0; i < encoded_bytes.length; i++) {
        bytes.push(this.byte_encoder[encoded_bytes[i]]);
      }
      token = bytes.join("");

      const new_tokens = this.bpe(token)
        .split(" ")
        .map((x) => this.encoder![x]);
      bpe_tokens = bpe_tokens.concat(new_tokens);
    }
    return bpe_tokens;
  }

  decode(tokens: number[]) {
    if (!this.byte_decoder || !this.decoder) {
      throw new Error("Tokenizer not loaded.");
    }
    let text = tokens.map((x) => this.decoder![x]).join("");
    text = this.textDecoder.decode(
      new Uint8Array(text.split("").map((x) => Number(this.byte_decoder![x]))),
    );
    return text;
  }

  bpe(token: string) {
    if (!this.bpe_ranks || !this.cache) {
      throw new Error("Tokenizer not loaded.");
    }
    if (this.cache.has(token)) return this.cache.get(token)!;
    let word = token.split("");
    let pairs = get_pairs(word);
    if (!pairs) return token;
    while (true) {
      const minPairs: Record<number, string> = {};
      pairs.forEach((pair) => {
        const rank = this.bpe_ranks![pair];
        minPairs[isNaN(rank) ? 10e10 : rank] = pair;
      });
      const keys = Object.keys(minPairs).map((x) => parseInt(x));
      const bigram = minPairs[Math.min(...keys)];
      if (!Object.hasOwn(this.bpe_ranks, bigram)) break;
      const first = bigram[0];
      const second = bigram[1];
      let new_word: string[] = [];
      let i = 0;
      while (i < word.length) {
        const j = word.indexOf(first, i);
        if (j === -1) {
          new_word = new_word.concat(word.slice(i));
          break;
        }
        new_word = new_word.concat(word.slice(i, j));
        i = j;
        if (
          word[i] === first &&
          i < word.length - 1 &&
          word[i + 1] === second
        ) {
          new_word.push(first + second);
          i = i + 2;
        } else {
          new_word.push(word[i]);
          i = i + 1;
        }
      }
      word = new_word;
      if (word.length === 1) break;
      else pairs = get_pairs(word);
    }
    const word2 = word.join(" ");
    this.cache!.set(token, word2);
    return word2;
  }
}

function range(x: number, y: number): number[] {
  const res = [];
  for (let i = x; i < y; i++) {
    res.push(i);
  }
  return res;
}

function ord(x: string): number {
  return x.charCodeAt(0);
}

function dictZip<X extends string | number | symbol, Y>(
  x: X[],
  y: Y[],
): Record<X, Y> {
  const result = {} as Record<X, Y>;
  x.forEach((_, i) => {
    result[x[i]] = y[i];
  });
  return result;
}

function bytes_to_unicode() {
  const bs = range(ord("!"), ord("~") + 1).concat(
    range(ord("¡"), ord("¬") + 1),
    range(ord("®"), ord("ÿ") + 1),
  );
  const cs = bs.slice();
  let n = 0;
  for (let b = 0; b < 2 ** 8; b++) {
    if (!bs.includes(b)) {
      bs.push(b);
      cs.push(2 ** 8 + n);
      n = n + 1;
    }
  }
  const cs2 = cs.map((x) => String.fromCharCode(x));
  const result: Record<number, string> = {};
  bs.forEach((_, i) => {
    result[bs[i]] = cs2[i];
  });
  return result;
}

function get_pairs(word: string[]) {
  const pairs = new Set<string>();
  let prev_char = word[0];
  for (let i = 1; i < word.length; i++) {
    const char = word[i];
    pairs.add(prev_char + char);
    prev_char = char;
  }
  return pairs;
}
