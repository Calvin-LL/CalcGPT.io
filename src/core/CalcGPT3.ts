import type { Completion } from "openai/resources";
import { Stream } from "openai/streaming";
import { displayToMathCharacters } from "../helpers";
import {
  CalcGPTGeneric,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  GPTCalculateArgs,
} from "./CalcGPT";

// only allow digits, decimal, and math operators
export const mathRegex = /^([+\-*/\d.])+$/;

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
    if (!mathRegex.test(math)) {
      outputHandler("invalid math expression");
      return;
    }

    const url = new URL("/.netlify/functions/math", window.location.href);
    url.searchParams.set("m", displayToMathCharacters(input));
    url.searchParams.set("t", temperature.toString());
    url.searchParams.set("p", topP.toString());

    const controller = new AbortController();
    const signal = controller.signal;

    const response = await fetch(url.toString(), {
      signal,
      headers: {
        accept: "text/event-stream",
      },
    });
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
