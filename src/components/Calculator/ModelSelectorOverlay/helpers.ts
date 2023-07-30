export function selectParentOption(el: HTMLElement) {
  const option = el.closest(".model-option")!;
  const radio = option.querySelector<HTMLInputElement>("input[type=radio]")!;
  option.classList.remove("disabled");
  radio.disabled = false;
  radio.checked = true;
  radio.dispatchEvent(new Event("change"));
}

export function disableParentOption(el: HTMLElement) {
  const option = el.closest(".model-option")!;
  const radio = option.querySelector<HTMLInputElement>("input[type=radio]")!;
  option.classList.add("disabled");
  radio.disabled = true;
  radio.checked = false;
  radio.dispatchEvent(new Event("change"));
}

function listenForTransitionEndOnce(el: HTMLElement, callback: () => void) {
  const duration = getComputedStyle(el).transitionDuration;
  let ran = false;

  el.addEventListener(
    "transitionend",
    () => {
      if (ran) {
        return;
      }
      ran = true;
      callback();
    },
    { once: true },
  );

  setTimeout(
    () => {
      if (ran) {
        return;
      }
      ran = true;
      callback();
    },
    parseFloat(duration) * 1000,
  );
}

export function openModelSelectorOverlay() {
  const calculator = document.getElementById("calculator")!;
  const content = calculator.querySelector<HTMLDivElement>(".content")!;
  const overlay = calculator.querySelector<HTMLDivElement>(".overlay")!;

  content.ariaHidden = "true";
  content.inert = true;

  listenForTransitionEndOnce(overlay, () => {
    overlay.classList.remove("open-from");
  });
  overlay.classList.remove("closed");
  overlay.classList.add("open-from");
  requestAnimationFrame(() => {
    overlay.classList.add("opened");
  });
}

export function closeModelSelectorOverlay() {
  const calculator = document.getElementById("calculator")!;
  const content = calculator.querySelector<HTMLDivElement>(".content")!;
  const overlay = calculator.querySelector<HTMLDivElement>(".overlay")!;

  content.ariaHidden = null;
  content.inert = false;

  listenForTransitionEndOnce(overlay, () => {
    overlay.classList.remove("opened");
    overlay.classList.remove("close-to");
    overlay.classList.add("closed");
  });
  overlay.classList.add("opened");
  overlay.classList.add("close-to");
}
