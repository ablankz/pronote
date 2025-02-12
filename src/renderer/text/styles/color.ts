// isLight=true: Light color(rate)

import { fixFloatingPoint } from "../utils/calc";

// isLight=false: Dark color(rate)
export interface LightnessColor {
    isLight: boolean;
    rate: number; // 0.0 ~ 1.0
}

export interface ColorOptions {
    lightness?: LightnessColor;
    saturation?: number; // 0 ~ 100
    alpha?: number; // 0 ~ 1
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

export function equalsRGBColor(a: RGBColor, b: RGBColor, options: RGBColorEqualOptions = { tolerance: 0, alphaTolerance: 0 }): boolean {
    const tolerance = options.tolerance || 0;
    return Math.abs(a.r - b.r) <= tolerance 
    && Math.abs(a.g - b.g) <= tolerance 
    && Math.abs(a.b - b.b) <= tolerance 
    && Math.abs(a.a - b.a) <= (options.alphaTolerance || 0);
}

export interface HSLColor {
    h: number;
    s: number;
    l: number;
    a: number;
}

export const DefaultHSLColor: HSLColor = {
    h: 0,
    s: 0,
    l: 0,
    a: 1,
};

export interface HSLColorEqualOptions {
    hueTolerance?: number;
    saturationTolerance?: number;
    lightnessTolerance?: number;
    alphaTolerance?: number;
}

export function equalsHSLColor(
    a: HSLColor, 
    b: HSLColor,
    options: HSLColorEqualOptions = { 
        hueTolerance: 0, 
        saturationTolerance: 0, 
        lightnessTolerance: 0, 
        alphaTolerance: 0 
    },
): boolean {
    return Math.abs(a.h - b.h) <= (options.hueTolerance || 0)
    && Math.abs(a.s - b.s) <= (options.saturationTolerance || 0)
    && Math.abs(a.l - b.l) <= (options.lightnessTolerance || 0)
    && Math.abs(a.a - b.a) <= (options.alphaTolerance || 0);
}

export interface Color {
    type: "rgb" | "hsl" | "hex";
    hex?: string;
    rgb?: RGBColor;
    hsl?: HSLColor;
}

export function wrapColor(color: Color | RGBColor | HSLColor | string): Color {
    if (typeof color === "string") {
        return resolveColor(color);
    }
    if (typeof color === "object") {
        if (!color) {
            throw new Error("Invalid color type: object");
        }
        if ("type" in color) {
            return color;
        }
        if ("r" in color && "g" in color && "b" in color) {
            return { type: "rgb", rgb: color };
        }
        if ("h" in color && "s" in color && "l" in color) {
            return { type: "hsl", hsl: color };
        }
        throw new Error("Invalid color object");
    }
    throw new Error("Invalid color");
}

export interface ColorEqualOptions {
    base: "rgb" | "hsl" | "hex";
    rgbTolerance?: number;
    hueTolerance?: number;
    saturationTolerance?: number;
    lightnessTolerance?: number;
    alphaTolerance?: number;
}

export function equalsColor(
    a: Color, 
    b: Color, 
    options: ColorEqualOptions = { 
        base: "rgb", 
        rgbTolerance: 0, 
        hueTolerance: 0, 
        saturationTolerance: 0, 
        lightnessTolerance: 0,
        alphaTolerance: 0,
    },
): boolean {
    switch (options.base) {
        case "rgb":
            const rgbA = colorToRGB(a);
            const rgbB = colorToRGB(b);
            return equalsRGBColor(rgbA, rgbB, {
                tolerance: options.rgbTolerance,
                alphaTolerance: options.alphaTolerance,
            });
        case "hsl":
            const hslA = colorToHSL(a);
            const hslB = colorToHSL(b);
            return equalsHSLColor(hslA, hslB, {
                hueTolerance: options.hueTolerance,
                saturationTolerance: options.saturationTolerance,
                lightnessTolerance: options.lightnessTolerance,
                alphaTolerance: options.alphaTolerance,
            });
        case "hex":
            const hexA = colorToHex(a);
            const hexB = colorToHex(b);
            return hexA === hexB;
    }
}

export const rgbFixedPrecision = 4;
export const hslHueFixedPrecision = 4;
export const hslSaturationFixedPrecision = 4;
export const hslLightnessFixedPrecision = 4;
export const alphaFixedPrecision = 2;

export function rgbToHsl(rgb: RGBColor): HSLColor {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) {
        return { 
            h: 0, 
            s: 0, 
            l: fixFloatingPoint(l * 100, 10 ** rgbFixedPrecision) / 10 ** rgbFixedPrecision,
            a: fixFloatingPoint(rgb.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
        };
    }
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    switch (max) {
        case r:
            h = ((g - b) / d) + (g < b ? 6 : 0);
            break;
        case g:
            h = ((b - r) / d) + 2;
            break;
        case b:
            h = ((r - g) / d) + 4;
            break;
    }
    h *= 60;
    return { 
        h: fixFloatingPoint(h, 10 ** hslHueFixedPrecision) / 10 ** hslHueFixedPrecision,
        s: fixFloatingPoint(s * 100, 10 ** hslSaturationFixedPrecision) / 10 ** hslSaturationFixedPrecision,
        l: fixFloatingPoint(l * 100, 10 ** hslLightnessFixedPrecision) / 10 ** hslLightnessFixedPrecision,
        a: fixFloatingPoint(rgb.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    };
}

export function hueToRgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}

export function hslToRgb(hsl: HSLColor): RGBColor {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hueToRgb(p, q, h + 1 / 3);
    const g = hueToRgb(p, q, h);
    const b = hueToRgb(p, q, h - 1 / 3);
    return { 
        r: fixFloatingPoint(r * 255, 10 ** rgbFixedPrecision) / 10 ** rgbFixedPrecision,
        g: fixFloatingPoint(g * 255, 10 ** rgbFixedPrecision) / 10 ** rgbFixedPrecision,
        b: fixFloatingPoint(b * 255, 10 ** rgbFixedPrecision) / 10 ** rgbFixedPrecision,
        a: fixFloatingPoint(hsl.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    };
}

export function rgbToHex(rgb: RGBColor): string {
    const hex = (c: number) => {
        const value = Math.round(c);
        const hex = value.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    };
    return `#${hex(rgb.r)}${hex(rgb.g)}${hex(rgb.b)}`;
}

export function hslToHex(hsl: HSLColor): string {
    return rgbToHex(hslToRgb(hsl));
}

export function hexToRgb(hex: string, alpha: number = 1): RGBColor {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) {
        throw new Error(`Invalid hex color: ${hex}`);
    }
    return {
        r: fixFloatingPoint(parseInt(match[1], 16), 10 ** rgbFixedPrecision) / 10 ** rgbFixedPrecision,
        g: fixFloatingPoint(parseInt(match[2], 16), 10 ** rgbFixedPrecision) / 10 ** rgbFixedPrecision,
        b: fixFloatingPoint(parseInt(match[3], 16), 10 ** rgbFixedPrecision) / 10 ** rgbFixedPrecision,
        a: fixFloatingPoint(alpha, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    };
}

export function hexToHsl(hex: string, alpha: number = 1): HSLColor {
    return rgbToHsl(hexToRgb(hex, alpha));
}

export function calcRgbColor(rgb: RGBColor, options: ColorOptions): string {
    const hsl = rgbToHsl(rgb);
    const lightness = options.lightness || { isLight: false, rate: 0 };
    const color = hslToRgb({
        h: hsl.h,
        s: options.saturation === undefined ? hsl.s : options.saturation,
        l: lightness.isLight ? hsl.l + (100 - hsl.l) * lightness.rate : hsl.l - hsl.l * lightness.rate,
        a: fixFloatingPoint(hsl.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    });
    const alpha = options.alpha !== undefined ? options.alpha : color.a;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

export function attachRgbColor(rgb: RGBColor, options: ColorOptions): RGBColor {
    const hsl = rgbToHsl(rgb);
    const lightness = options.lightness || { isLight: false, rate: 0 };
    const color = hslToRgb({
        h: hsl.h,
        s: options.saturation === undefined ? hsl.s : options.saturation,
        l: lightness.isLight ? hsl.l + (100 - hsl.l) * lightness.rate : hsl.l - hsl.l * lightness.rate,
        a: fixFloatingPoint(hsl.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    });
    const alpha = options.alpha !== undefined ? options.alpha : color.a;
    return { 
        r: color.r, 
        g: color.g, 
        b: color.b, 
        a: alpha 
    };
}

export function calcHslColor(hsl: HSLColor, options: ColorOptions): string {
    const lightness = options.lightness || { isLight: false, rate: 0 };
    const color = hslToRgb({
        h: hsl.h,
        s: options.saturation === undefined ? hsl.s : options.saturation,
        l: lightness.isLight ? hsl.l + (100 - hsl.l) * lightness.rate : hsl.l - hsl.l * lightness.rate,
        a: fixFloatingPoint(hsl.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    });
    const alpha = options.alpha !== undefined ? options.alpha : color.a;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

export function attachHslColor(hsl: HSLColor, options: ColorOptions): HSLColor {
    const lightness = options.lightness || { isLight: false, rate: 0 };
    const color = hslToRgb({
        h: hsl.h,
        s: options.saturation === undefined ? hsl.s : options.saturation,
        l: lightness.isLight ? hsl.l + (100 - hsl.l) * lightness.rate : hsl.l - hsl.l * lightness.rate,
        a: fixFloatingPoint(hsl.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    });
    const alpha = options.alpha !== undefined ? options.alpha : color.a;
    return { 
        h: hsl.h, 
        s: hsl.s, 
        l: hsl.l, 
        a: alpha 
    };
}

export function calcHexColor(hex: string, options: ColorOptions): string {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    const lightness = options.lightness || { isLight: false, rate: 0 };
    const color = hslToRgb({
        h: hsl.h,
        s: options.saturation === undefined ? hsl.s : options.saturation,
        l: lightness.isLight ? hsl.l + (100 - hsl.l) * lightness.rate : hsl.l - hsl.l * lightness.rate,
        a: fixFloatingPoint(hsl.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    });
    const alpha = options.alpha !== undefined ? options.alpha : color.a;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

export function attachHexColor(hex: string, options: ColorOptions): string {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    const lightness = options.lightness || { isLight: false, rate: 0 };
    const color = hslToRgb({
        h: hsl.h,
        s: options.saturation === undefined ? hsl.s : options.saturation,
        l: lightness.isLight ? hsl.l + (100 - hsl.l) * lightness.rate : hsl.l - hsl.l * lightness.rate,
        a: fixFloatingPoint(hsl.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    });
    const alpha = options.alpha !== undefined ? options.alpha : color.a;
    return rgbToHex({ 
        r: color.r, 
        g: color.g, 
        b: color.b, 
        a: alpha 
    });
}

export function calcColor(baseColor: Color, options: ColorOptions): string {
    const { lightness, saturation, alpha } = options;
    switch (baseColor.type) {
        case "rgb":
            if (!baseColor.rgb) {
                throw new Error("Invalid color type: rgb");
            }
            return calcRgbColor(baseColor.rgb, { lightness, saturation, alpha });
        case "hsl":
            if (!baseColor.hsl) {
                throw new Error("Invalid color type: hsl");
            }
            return calcHslColor(baseColor.hsl, { lightness, saturation, alpha });
        case "hex":
            if (!baseColor.hex) {
                throw new Error("Invalid color type: hex");
            }
            return calcHexColor(baseColor.hex, { lightness, saturation, alpha });
    }
}

export function attachColor(baseColor: Color, options: ColorOptions): Color {
    const { lightness, saturation, alpha } = options;
    switch (baseColor.type) {
        case "rgb":
            if (!baseColor.rgb) {
                throw new Error("Invalid color type: rgb");
            }
            return { 
                type: "rgb", 
                rgb: attachRgbColor(baseColor.rgb, { lightness, saturation, alpha }),
            };
        case "hsl":
            if (!baseColor.hsl) {
                throw new Error("Invalid color type: hsl");
            }
            return { 
                type: "hsl", 
                hsl: attachHslColor(baseColor.hsl, { lightness, saturation, alpha }),
            };
        case "hex":
            if (!baseColor.hex) {
                throw new Error("Invalid color type: hex");
            }
            return { 
                type: "hex", 
                hex: attachHexColor(baseColor.hex, { lightness, saturation, alpha }),
            };
    }
}

export function resolveHexColor(color: string): string {
    if (color.startsWith("#")) {
        return color;
    }
    throw new Error(`Invalid color: ${color}`);
}

export function resolveRGBColor(color: string): RGBColor {
    const match = color.match(/rgba?\(\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*(?:,\s*([\d.]+))?\s*\)/);

    if (!match) {
        throw new Error(`Invalid color: ${color}`);
    }
    return { 
        r: parseFloat(match[1]), 
        g: parseFloat(match[2]), 
        b: parseFloat(match[3]),
        a: parseFloat(match[4])
    };
}

export function resolveHSLColor(color: string): HSLColor {
    const match = color.match(/hsla?\(\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)%\s*,\s*(\d+\.?\d*)%\s*(?:,\s*([\d.]+))?\s*\)/);
    if (!match) {
        throw new Error(`Invalid color: ${color}`);
    }
    return { 
        h: parseFloat(match[1]), 
        s: parseFloat(match[2]), 
        l: parseFloat(match[3]),
        a: parseFloat(match[4])
    };
}

export function colorToRGB(color: Color): RGBColor {
    switch (color.type) {
        case "rgb":
            if (!color.rgb) {
                throw new Error("Invalid color type: rgb");
            }
            return color.rgb;
        case "hsl":
            if (!color.hsl) {
                throw new Error("Invalid color type: hsl");
            }
            return hslToRgb(color.hsl);
        case "hex":
            if (!color.hex) {
                throw new Error("Invalid color type: hex");
            }
            return hexToRgb(color.hex);
    }
}

export function colorToHSL(color: Color): HSLColor {
    switch (color.type) {
        case "rgb":
            if (!color.rgb) {
                throw new Error("Invalid color type: rgb");
            }
            return rgbToHsl(color.rgb);
        case "hsl":
            if (!color.hsl) {
                throw new Error("Invalid color type: hsl");
            }
            return color.hsl;
        case "hex":
            if (!color.hex) {
                throw new Error("Invalid color type: hex");
            }
            return rgbToHsl(hexToRgb(color.hex));
    }
}

export function colorToHex(color: Color): string {
    switch (color.type) {
        case "rgb":
            if (!color.rgb) {
                throw new Error("Invalid color type: rgb");
            }
            return rgbToHex(color.rgb);
        case "hsl":
            if (!color.hsl) {
                throw new Error("Invalid color type: hsl");
            }
            return hslToHex(color.hsl);
        case "hex":
            if (!color.hex) {
                throw new Error("Invalid color type: hex");
            }
            return color.hex;
    }
}

export function resolveColor(color: string): Color {
    if (color.startsWith("#")) {
        return { type: "hex", hex: color };
    }
    if (color.startsWith("rgb")) {
        const match = color.match(/rgba?\(\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*(?:,\s*([\d.]+))?\s*\)/);
        if (!match) {
            throw new Error(`Invalid color: ${color}`);
        }
        return { 
            type: "rgb", 
            rgb: { 
                r: parseFloat(match[1]), 
                g: parseFloat(match[2]), 
                b: parseFloat(match[3]),
                a: parseFloat(match[4])
            },
        };
    }
    if (color.startsWith("hsl")) {
        const match = color.match(/hsla?\(\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)%\s*,\s*(\d+\.?\d*)%\s*(?:,\s*([\d.]+))?\s*\)/);
        if (!match) {
            throw new Error(`Invalid color: ${color}`);
        }
        return { 
            type: "hsl", 
            hsl: { 
                h: parseFloat(match[1]), 
                s: parseFloat(match[2]), 
                l: parseFloat(match[3]),
                a: parseFloat(match[4])
            },
        };
    }
    throw new Error(`Invalid color: ${color}`);
}

export function colorToString(
    color: Color | RGBColor | HSLColor | string, 
    to: "rgb" | "hsl" | "hex" | null = null,
    alpha: number = 1,
): string {
    switch (typeof color) {
        case "string":
            switch (to) {
                case "rgb":
                    return colorToString(hexToRgb(color, alpha), "rgb");
                case "hsl":
                    return colorToString(hexToHsl(color, alpha), "hsl");
                case "hex":
                default:
                    return color;
            }
        case "object":
            if (!color) {
                throw new Error("Invalid color type: object");
            }
            if ("type" in color) {
                switch (color.type) {
                    case "rgb":
                        if (!color.rgb) {
                            throw new Error("Invalid color type: rgb");
                        }
                        return colorToString(color.rgb, to, alpha);
                    case "hsl":
                        if (!color.hsl) {
                            throw new Error("Invalid color type: hsl");
                        }
                        return colorToString(color.hsl, to, alpha);
                    case "hex":
                        if (!color.hex) {
                            throw new Error("Invalid color type: hex");
                        }
                        return colorToString(color.hex, to, alpha);
                    default:
                        throw new Error("Invalid color type");
                    }
            }
            if ("r" in color && "g" in color && "b" in color) {
                switch (to) {
                    case "hsl":
                        return colorToString(rgbToHsl(color), "hsl");
                    case "hex":
                        return colorToString(rgbToHex(color), "hex");
                    case "rgb":
                    default:
                        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
                }
            }
            if ("h" in color && "s" in color && "l" in color) {
                switch (to) {
                    case "rgb":
                        return colorToString(hslToRgb(color), "rgb");
                    case "hex":
                        return colorToString(hslToHex(color), "hex");
                    case "hsl":
                    default:
                        return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${color.a})`;
                }
            }
            throw new Error("Invalid color object");
    }
}