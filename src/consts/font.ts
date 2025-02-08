import { LightnessColor } from "../utils/color";

export const fontList = [
  "Arial", "Verdana", "Times New Roman", "Courier New", "Georgia",
  "Trebuchet MS", "Comic Sans MS", "Impact", "Tahoma", "Garamond",
  "Monospace", "Noto Sans JP", "Roboto", "Open Sans", "Lato",
];

export const minFontSize = 6;

export const fontSizeList = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72,
];

export const representFontColorList = [
  "#000000", // black
  "#ffffff", // white
  "#ff0000", // red
  "#00ff00", // green
  "#0000ff", // blue
  "#ffff00", // yellow
  "#ff00ff", // magenta
  "#00ffff", // cyan
  "#ff8000", // orange
  "#8000ff", // purple
  "#0080ff", // skyblue
  "#ff0080", // pink
  "#008000", // darkgreen
];

// red
export const defaultFontColor = "hsla(0, 100%, 50%, 1)";

export const lightnessRateList: LightnessColor[] = [
  { isLight: true, rate: 0.75},
  { isLight: true, rate: 0.5},
  { isLight: true, rate: 0.25},
  { isLight: false, rate: 0.25},
  { isLight: false, rate: 0.5},
  { isLight: false, rate: 0.75},
];

export const representHighlightColorList = [
  "#000000", // black
  "#ffffff", // white
  "#ff0000", // red
  "#00ff00", // green
  "#0000ff", // blue
  "#ffff00", // yellow
  "#ff00ff", // magenta
  "#00ffff", // cyan
  "#ff8000", // orange
  "#8000ff", // purple
  "#0080ff", // skyblue
  "#ff0080", // pink
  "#008000", // darkgreen
];

// yellow
export const defaultHighlightColor = "hsla(60, 100%, 50%, 1)";
