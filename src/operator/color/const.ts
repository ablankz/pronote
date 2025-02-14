import { ColorEqualOptions, HSLColor, LightnessColor } from "./types";

export const DefaultHSLColor: HSLColor = {
    h: 0,
    s: 0,
    l: 0,
    a: 1,
};

export const rgbFixedPrecision = 4;
export const hslHueFixedPrecision = 4;
export const hslSaturationFixedPrecision = 4;
export const hslLightnessFixedPrecision = 4;
export const alphaFixedPrecision = 2;
export const displayAlphaPrecision = 2;
export const displayRGBPrecision = 0;
export const displayHuePrecision = 0;
export const displaySaturationPrecision = 0;
export const displayLightnessPrecision = 0;

export const defaultRepresentColorList = [
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

export const defaultColor = "hsla(0, 100%, 50%, 1)";

export const defaultLightnessRateList: LightnessColor[] = [
  { isLight: true, rate: 0.75},
  { isLight: true, rate: 0.5},
  { isLight: true, rate: 0.25},
  { isLight: false, rate: 0.25},
  { isLight: false, rate: 0.5},
  { isLight: false, rate: 0.75},
];

export const defaultColorEqualsOptions: ColorEqualOptions = { 
    base: "hsl", 
    rgbTolerance: 0, 
    hueTolerance: 10, 
    saturationTolerance: 5,
    lightnessTolerance: 5,
    alphaTolerance: 1,
};

export const defaultColorPickerTitle = "Select a color";
export const defaultColorDropdownTitle = "Select a color";