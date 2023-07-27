import { downloadedSize } from "./DownloadedSize";

export const downloadAbortController = new AbortController();
const downloadAbortSignal = downloadAbortController.signal;

export async function fetchBin(url: string): Promise<Float32Array> {
  if (url.endsWith("/transformer.wte.weight_gpt.bin")) {
    // this file is so big it has been split into 2 parts
    const part1Url = url.replace(
      "/transformer.wte.weight_gpt.bin",
      "/transformer.wte.weight_gpt.part1.bin",
    );
    const part2Url = url.replace(
      "/transformer.wte.weight_gpt.bin",
      "/transformer.wte.weight_gpt.part2.bin",
    );

    const [response1, response2] = await Promise.all([
      fetch(part1Url, { signal: downloadAbortSignal }),
      fetch(part2Url, { signal: downloadAbortSignal }),
    ]);
    const [buffer1, buffer2] = await Promise.all([
      countDownloadSize(response1),
      countDownloadSize(response2),
    ]);
    const buffer = new Uint8Array(buffer1.length + buffer2.length);
    buffer.set(buffer1);
    buffer.set(buffer2, buffer1.length);

    return new Float32Array(buffer.buffer);
  }

  const response = await fetch(url, { signal: downloadAbortSignal });
  const buffer = await countDownloadSize(response);

  return new Float32Array(buffer.buffer);
}

export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { signal: downloadAbortSignal });
  const buffer = await countDownloadSize(response);

  return new TextDecoder("utf-8").decode(buffer);
}

export async function fetchJson(url: string): Promise<any> {
  return JSON.parse(await fetchText(url));
}

async function countDownloadSize(response: Response): Promise<Uint8Array> {
  if (!response.body) {
    throw new Error("Response body is undefined");
  }

  const reader = response.body.getReader();

  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    downloadedSize.add(value.length);
  }

  const chunksAllSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const chunksAll = new Uint8Array(chunksAllSize);
  let position = 0;

  for (let chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }

  return chunksAll;
}
