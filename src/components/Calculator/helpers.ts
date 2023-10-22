import type { CalcGPT } from "../../core/CalcGPT";
import { mathToDisplayCharacters } from "../../helpers";

declare global {
  // indicate whether we are waiting for the model to predict the next output
  var isPredicting: boolean;
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

export function predictAnswer() {
  if (globalThis.isPredicting) {
    return;
  }

  mathOutput.innerText = "";

  globalThis.isPredicting = true;
  globalThis.calcGPT
    .calculate({
      input: mathInput.value,
      outputHandler: (newToken: string) => {
        mathOutput.innerText += mathToDisplayCharacters(newToken);
      },
      temperature: Number(temperatureSlider.value),
      topP: Number(topPSlider.value),
    })
    .catch((e: Error) => {
      mathOutput.innerText = e.message;
    })
    .finally(() => {
      globalThis.isPredicting = false;
    });
}
