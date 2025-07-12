import type { CalcGPT } from "../../core/CalcGPT";
import { mathToDisplayCharacters } from "../../helpers";
import { FunctionQueue } from "./FunctionQueue";

declare global {
  var calcGPT: CalcGPT;
}

const calculator = document.getElementById("calculator")!;
const mathInput = document.getElementById("math-input") as HTMLTextAreaElement;
const mathOutput = document.getElementById("math-output") as HTMLDivElement;
const temperatureSlider = calculator.querySelector(
  'div.slider.temperature input[type="number"]',
) as HTMLInputElement;
const topPSlider = calculator.querySelector(
  'div.slider.top-p input[type="number"]',
) as HTMLInputElement;

let abortController: AbortController | undefined;
let lastPromise: Promise<void> | undefined;
let cancelling = false;
const functionQueue = new FunctionQueue(500);

export function clear() {
  abortController?.abort();
  functionQueue.clear();
  mathInput.value = "";
  mathOutput.innerText = "";
  mathOutput.classList.remove("loading");
}

export async function predictAnswer() {
  if (cancelling) {
    return;
  }

  abortController?.abort();
  if (lastPromise) {
    cancelling = true;
    await lastPromise;
    cancelling = false;
  }
  functionQueue.clear();
  mathOutput.innerText = "";

  abortController = new AbortController();
  mathOutput.classList.add("loading");
  lastPromise = globalThis.calcGPT
    .calculate({
      input: mathInput.value,
      outputHandler: (newToken: string) => {
        mathToDisplayCharacters(newToken)
          .split("")
          .forEach((char) => {
            functionQueue.add(() => {
              mathOutput.innerText += char;
            });
          });
      },
      temperature: Number(temperatureSlider.value),
      topP: Number(topPSlider.value),
      abortController,
    })
    .catch((e: Error) => {
      functionQueue.clear();
      mathOutput.innerText = e.message;
    })
    .finally(() => {
      functionQueue.add(() => {
        mathOutput.classList.remove("loading");
      }, true);
    });
}
