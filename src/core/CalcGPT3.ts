import type { Completion } from "openai/resources";
import { Stream } from "openai/streaming";
import { displayToMathCharacters } from "../helpers";
import {
  CalcGPTGeneric,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  GPTCalculateArgs,
} from "./CalcGPT";

export const MATH_LENGTH_LIMIT = 30;

export class CalcGPT3 extends CalcGPTGeneric {
  constructor() {
    super();
  }

  async calculate({
    input,
    outputHandler,
    temperature = DEFAULT_TEMPERATURE,
    topP = DEFAULT_TOP_P,
  }: GPTCalculateArgs): Promise<void> {
    const math = displayToMathCharacters(input);
    if (math.length > MATH_LENGTH_LIMIT) {
      outputHandler("math expression too long");
      return;
    }

    const url = new URL("/.netlify/functions/math", window.location.href);
    url.searchParams.set("m", displayToMathCharacters(input));
    url.searchParams.set("t", temperature.toString());
    url.searchParams.set("p", topP.toString());

    const controller = new AbortController();
    const signal = controller.signal;

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        signal,
        headers: {
          accept: "text/event-stream",
        },
      });
    } catch (error) {
      outputHandler("api error");
      return;
    }
    if (!response.body) {
      outputHandler("api error");
      return;
    }
    if (response.status !== 200) {
      outputHandler((await response.text()) ?? "api error");
      return;
    }

    const stream = new Stream<Completion>(response, controller);

    for await (const part of stream) {
      const newToken = part.choices[0].text;

      outputHandler(newToken);
    }
  }
}
