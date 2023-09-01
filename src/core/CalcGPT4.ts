import OpenAI from "openai";
import { displayToMathCharacters } from "../helpers";
import {
  CalcGPTGeneric,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  type GPTCalculateArgs,
} from "./CalcGPT";

const systemMessage = "You are a calculator.";

export class CalcGPT4 extends CalcGPTGeneric {
  private api: OpenAI;

  constructor(apiKey: string) {
    super();

    this.api = new OpenAI({ apiKey });
  }
  async calculate({
    input,
    outputHandler,
    temperature = DEFAULT_TEMPERATURE,
    topP = DEFAULT_TOP_P,
  }: GPTCalculateArgs): Promise<void> {
    const stream = await this.api.chat.completions.create({
      model: "gpt-4",
      temperature,
      top_p: topP,
      stop: "\n",
      messages: [
        { role: "system", content: systemMessage },
        {
          role: "user",
          content: displayToMathCharacters(input),
        },
      ],
      stream: true,
    });

    for await (const part of stream) {
      const newToken = part.choices[0]?.delta?.content || "";

      outputHandler(newToken);
    }
  }
}
