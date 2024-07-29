import type { HexColor } from "./types/CssColor";

export function colorLuminance(hex: HexColor, lum: number): HexColor {
  // check with RegExp
  console.assert(/^#[0-9A-F]{6}$/i.test(hex) || /^#[0-9A-F]{3}$/i.test(hex));

  let hexWithoutHash = hex.slice(1);

  // validate hex string
  if (hexWithoutHash.length < 6) {
    hexWithoutHash =
      hexWithoutHash[0] +
      hexWithoutHash[0] +
      hexWithoutHash[1] +
      hexWithoutHash[1] +
      hexWithoutHash[2] +
      hexWithoutHash[2];
  }
  lum = lum ?? 0;

  // convert to decimal and change luminosity
  let rgb: HexColor = "#";

  for (let i = 0; i < 3; i++) {
    const c = parseInt(hexWithoutHash.substr(i * 2, 2), 16);
    const cString = Math.round(
      Math.min(Math.max(0, c + c * lum), 255),
    ).toString(16);
    rgb += ("00" + cString).substr(cString.length);
  }

  return rgb;
}

export function mathToDisplayCharacters(s: string): string {
  return s.replaceAll("/", "÷").replaceAll("*", "×").replaceAll("-", "−");
}

export function displayToMathCharacters(s: string): string {
  return s.replaceAll("÷", "/").replaceAll("×", "*").replaceAll("−", "-");
}
