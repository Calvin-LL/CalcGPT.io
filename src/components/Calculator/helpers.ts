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

// indicate whether we are waiting for the model to predict the next output
let isPredicting = false;
let abortController: AbortController | undefined = undefined;
const functionQueue = new FunctionQueue(500);

export function clear() {
  isPredicting = false;
  abortController?.abort();
  functionQueue.clear();
  mathInput.value = "";
  mathOutput.innerText = "";
  mathOutput.classList.remove("loading");
}

export function predictAnswer() {
  // if (isPredicting) {
  //   return;
  // }

  abortController?.abort();
  functionQueue.clear();
  mathOutput.innerText = "";

  isPredicting = true;
  abortController = new AbortController();
  mathOutput.classList.add("loading");
  globalThis.calcGPT
    .calculate({
      input: mathInput.value,
      outputHandler: (newToken: string) => {
        // console.log(newToken);
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
        isPredicting = false;
        mathOutput.classList.remove("loading");
      }, true);
    });
}
