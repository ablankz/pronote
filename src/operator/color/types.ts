export interface LightnessColor {
    isLight: boolean;
    rate: number; // 0.0 ~ 1.0
}

export interface ColorHSLOptions {
    lightness?: LightnessColor;
    saturation?: number; // 0 ~ 100
    alpha?: number; // 0 ~ 1
}

export interface ColorOptions {
    rgbPrecision?: number;
    hslHuePrecision?: number;
    hslSaturationPrecision?: number;
    hslLightnessPrecision?: number;
    alphaPrecision?: number;
}

export interface RGBColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface RGBColorEqualOptions {
    tolerance?: number;
    alphaTolerance?: number;
}

export interface HSLColor {
    h: number;
    s: number;
    l: number;
    a: number;
}

export interface HSLColorEqualOptions {
    hueTolerance?: number;
    saturationTolerance?: number;
    lightnessTolerance?: number;
    alphaTolerance?: number;
}

export interface Color {
    type: "rgb" | "hsl" | "hex";
    hex?: string;
    rgb?: RGBColor;
    hsl?: HSLColor;
}

export interface ColorEqualOptions {
    base: "rgb" | "hsl" | "hex";
    rgbTolerance?: number;
    hueTolerance?: number;
    saturationTolerance?: number;
    lightnessTolerance?: number;
    alphaTolerance?: number;
}