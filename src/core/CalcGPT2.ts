import { displayToMathCharacters } from "../helpers";
import {
  CalcGPTGeneric,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  GPTCalculateArgs,
} from "./CalcGPT";
import {
  downloadedSize,
  type DownloadedSizeChangeListener,
} from "./WebGPT/DownloadedSize";
import { downloadAbortController } from "./WebGPT/fetch";
import { GPT } from "./WebGPT/model";

export class CalcGPT2 extends CalcGPTGeneric {
  gpt: GPT;

  constructor() {
    super();

    this.gpt = new GPT();
  }

  loadModel(listener: DownloadedSizeChangeListener) {
    downloadedSize.addDownloadSizeChangeListener(listener);

    return [
      this.gpt.initialize().then(() => {
        downloadedSize.removeDownloadSizeChangeListener(listener);
      }),
      downloadAbortController,
    ] as const;
  }

  async calculate({
    input,
    outputHandler,
    temperature = DEFAULT_TEMPERATURE,
    topP = DEFAULT_TOP_P,
  }: GPTCalculateArgs): Promise<void> {
    const prompt = `1+1=2\n5-2=3\n2*4=8\n9/3=3\n${displayToMathCharacters(
      input,
    )}=`;
    const textStream = this.gpt.generate(prompt, 100, topP, temperature, "\n");

    for await (const text of textStream) {
      outputHandler(text);
    }
  }
}
