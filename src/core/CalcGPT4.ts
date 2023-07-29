import { Configuration, OpenAIApi } from "openai";
import {
  CalcGPTGeneric,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  GPTCalculateArgs,
} from "./CalcGPT";

const systemMessage = "You are a calculator.";

export class CalcGPT4 extends CalcGPTGeneric {
  private api: OpenAIApi;

  constructor(apiKey: string) {
    super();

    const configuration = new Configuration({
      apiKey,
    });
    this.api = new OpenAIApi(configuration);
  }
  async calculate({
    input,
    outputHandler,
    temperature = DEFAULT_TEMPERATURE,
    topP = DEFAULT_TOP_P,
  }: GPTCalculateArgs): Promise<void> {
    const res = await this.api.createChatCompletion(
      {
        model: "gpt-4",
        temperature,
        top_p: topP,
        messages: [
          { role: "system", content: systemMessage },
          {
            role: "user",
            content: input,
          },
        ],
        stream: true,
      },
      { responseType: "stream" },
    );
    console.log(res.data);
    // @ts-ignore
    res.data.on("data", (data) => console.log(data.toString()));
  }
}
