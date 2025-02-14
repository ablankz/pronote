import { fixFloatingPoint } from "../../utils/calc";
import { 
    alphaFixedPrecision,  
    hslHueFixedPrecision,  
    hslLightnessFixedPrecision, 
    hslSaturationFixedPrecision, 
    rgbFixedPrecision,
} from "./const";
import { 
    ColorHSLOptions, 
    ColorOptions,
    RGBColor,
    HSLColor,
    Color,
    HSLColorEqualOptions,
    RGBColorEqualOptions,
    ColorEqualOptions,
} from "./types";

export function equalsRGBColor(
    a: RGBColor, 
    b: RGBColor, 
    options: RGBColorEqualOptions = { tolerance: 0, alphaTolerance: 0 }
): boolean {
    const tolerance = options.tolerance || 0;
    return Math.abs(a.r - b.r) <= tolerance 
    && Math.abs(a.g - b.g) <= tolerance 
    && Math.abs(a.b - b.b) <= tolerance 
    && Math.abs(a.a - b.a) <= (options.alphaTolerance || 0);
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

export function rgbToHsl(
    rgb: RGBColor,
    options: ColorOptions = {},
): HSLColor {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const rgbPrecision = options.rgbPrecision || rgbFixedPrecision;
    const alphaPrecision = options.alphaPrecision || alphaFixedPrecision;
    if (max === min) {
        return { 
            h: 0, 
            s: 0, 
            l: fixFloatingPoint(l * 100, 10 ** rgbPrecision) / 10 ** rgbPrecision,
            a: fixFloatingPoint(rgb.a, 10 ** alphaPrecision) / 10 ** alphaPrecision
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
    const hslHuePrecision = options.hslHuePrecision || hslHueFixedPrecision;
    const hslSaturationPrecision = options.hslSaturationPrecision || hslSaturationFixedPrecision;
    const hslLightnessPrecision = options.hslLightnessPrecision || hslLightnessFixedPrecision;
    return { 
        h: fixFloatingPoint(h, 10 ** hslHuePrecision) / 10 ** hslHuePrecision,
        s: fixFloatingPoint(s * 100, 10 ** hslSaturationPrecision) / 10 ** hslSaturationPrecision,
        l: fixFloatingPoint(l * 100, 10 ** hslLightnessPrecision) / 10 ** hslLightnessPrecision,
        a: fixFloatingPoint(rgb.a, 10 ** alphaPrecision) / 10 ** alphaPrecision
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

export function hslToRgb(
    hsl: HSLColor,
    options: ColorOptions = {},
): RGBColor {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hueToRgb(p, q, h + 1 / 3);
    const g = hueToRgb(p, q, h);
    const b = hueToRgb(p, q, h - 1 / 3);
    const rgbPrecision = options.rgbPrecision || rgbFixedPrecision;
    const alphaPrecision = options.alphaPrecision || alphaFixedPrecision;
    return { 
        r: fixFloatingPoint(r * 255, 10 ** rgbPrecision) / 10 ** rgbPrecision,
        g: fixFloatingPoint(g * 255, 10 ** rgbPrecision) / 10 ** rgbPrecision,
        b: fixFloatingPoint(b * 255, 10 ** rgbPrecision) / 10 ** rgbPrecision,
        a: fixFloatingPoint(hsl.a, 10 ** alphaPrecision) / 10 ** alphaPrecision
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

export function hslToHex(
    hsl: HSLColor,
    options: ColorOptions = {},
): string {
    return rgbToHex(hslToRgb(hsl, options));
}

export function hexToRgb(
    hex: string, 
    alpha: number = 1,
    options: ColorOptions = {},
): RGBColor {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) {
        throw new Error(`Invalid hex color: ${hex}`);
    }
    const rgbPrecision = options.rgbPrecision || rgbFixedPrecision;
    const alphaPrecision = options.alphaPrecision || alphaFixedPrecision;
    return {
        r: fixFloatingPoint(parseInt(match[1], 16), 10 ** rgbPrecision) / 10 ** rgbPrecision,
        g: fixFloatingPoint(parseInt(match[2], 16), 10 ** rgbPrecision) / 10 ** rgbPrecision,
        b: fixFloatingPoint(parseInt(match[3], 16), 10 ** rgbPrecision) / 10 ** rgbPrecision,
        a: fixFloatingPoint(alpha, 10 ** alphaPrecision) / 10 ** alphaPrecision
    };
}

export function hexToHsl(
    hex: string, 
    alpha: number = 1,
    options: ColorOptions = {},
): HSLColor {
    return rgbToHsl(hexToRgb(hex, alpha, options), options);
}

export function calcRgbColor(
    rgb: RGBColor, 
    hslOptions: ColorHSLOptions,
    options: ColorOptions = {},
): string {
    const hsl = rgbToHsl(rgb, options);
    const lightness = hslOptions.lightness || { isLight: false, rate: 0 };
    const color = hslToRgb({
        h: hsl.h,
        s: hslOptions.saturation === undefined ? hsl.s : hslOptions.saturation,
        l: lightness.isLight ? hsl.l + (100 - hsl.l) * lightness.rate : hsl.l - hsl.l * lightness.rate,
        a: fixFloatingPoint(hsl.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    }, options);
    const alpha = hslOptions.alpha !== undefined ? hslOptions.alpha : color.a;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

export function attachRgbColor(
    rgb: RGBColor, 
    hslOptions: ColorHSLOptions,
    options: ColorOptions = {},
): RGBColor {
    const hsl = rgbToHsl(rgb, options);
    const lightness = hslOptions.lightness || { isLight: false, rate: 0 };
    const color = hslToRgb({
        h: hsl.h,
        s: hslOptions.saturation === undefined ? hsl.s : hslOptions.saturation,
        l: lightness.isLight ? hsl.l + (100 - hsl.l) * lightness.rate : hsl.l - hsl.l * lightness.rate,
        a: fixFloatingPoint(hsl.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    }, options);
    const alpha = hslOptions.alpha !== undefined ? hslOptions.alpha : color.a;
    return { 
        r: color.r, 
        g: color.g, 
        b: color.b, 
        a: alpha 
    };
}

export function calcHslColor(
    hsl: HSLColor, 
    hslOptions: ColorHSLOptions,
    options: ColorOptions = {},
): string {
    const lightness = hslOptions.lightness || { isLight: false, rate: 0 };
    const color = hslToRgb({
        h: hsl.h,
        s: hslOptions.saturation === undefined ? hsl.s : hslOptions.saturation,
        l: lightness.isLight ? hsl.l + (100 - hsl.l) * lightness.rate : hsl.l - hsl.l * lightness.rate,
        a: fixFloatingPoint(hsl.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    }, options);
    const alpha = hslOptions.alpha !== undefined ? hslOptions.alpha : color.a;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

export function attachHslColor(
    hsl: HSLColor, 
    hslOptions: ColorHSLOptions,
    options: ColorOptions = {},
): HSLColor {
    const lightness = hslOptions.lightness || { isLight: false, rate: 0 };
    const color = hslToRgb({
        h: hsl.h,
        s: hslOptions.saturation === undefined ? hsl.s : hslOptions.saturation,
        l: lightness.isLight ? hsl.l + (100 - hsl.l) * lightness.rate : hsl.l - hsl.l * lightness.rate,
        a: fixFloatingPoint(hsl.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    }, options);
    const alpha = hslOptions.alpha !== undefined ? hslOptions.alpha : color.a;
    return { 
        h: hsl.h, 
        s: hsl.s, 
        l: hsl.l, 
        a: alpha 
    };
}

export function calcHexColor(
    hex: string, 
    hslOptions: ColorHSLOptions,
    options: ColorOptions = {},
): string {
    const rgb = hexToRgb(hex, hslOptions.alpha || 1, options);
    const hsl = rgbToHsl(rgb, options);
    const lightness = hslOptions.lightness || { isLight: false, rate: 0 };
    const color = hslToRgb({
        h: hsl.h,
        s: hslOptions.saturation === undefined ? hsl.s : hslOptions.saturation,
        l: lightness.isLight ? hsl.l + (100 - hsl.l) * lightness.rate : hsl.l - hsl.l * lightness.rate,
        a: fixFloatingPoint(hsl.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    }, options);
    const alpha = hslOptions.alpha !== undefined ? hslOptions.alpha : color.a;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

export function attachHexColor(
    hex: string, 
    hslOptions: ColorHSLOptions,
    options: ColorOptions = {},
): string {
    const rgb = hexToRgb(hex, hslOptions.alpha || 1, options);
    const hsl = rgbToHsl(rgb, options);
    const lightness = hslOptions.lightness || { isLight: false, rate: 0 };
    const color = hslToRgb({
        h: hsl.h,
        s: hslOptions.saturation === undefined ? hsl.s : hslOptions.saturation,
        l: lightness.isLight ? hsl.l + (100 - hsl.l) * lightness.rate : hsl.l - hsl.l * lightness.rate,
        a: fixFloatingPoint(hsl.a, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision
    }, options);
    const alpha = hslOptions.alpha !== undefined ? hslOptions.alpha : color.a;
    return rgbToHex({ 
        r: color.r, 
        g: color.g, 
        b: color.b, 
        a: alpha 
    });
}

export function calcColor(
    baseColor: Color, 
    hslOptions: ColorHSLOptions,
    options: ColorOptions = {},
): string {
    const { lightness, saturation, alpha } = hslOptions;
    switch (baseColor.type) {
        case "rgb":
            if (!baseColor.rgb) {
                throw new Error("Invalid color type: rgb");
            }
            return calcRgbColor(baseColor.rgb, { lightness, saturation, alpha }, options);
        case "hsl":
            if (!baseColor.hsl) {
                throw new Error("Invalid color type: hsl");
            }
            return calcHslColor(baseColor.hsl, { lightness, saturation, alpha }, options);
        case "hex":
            if (!baseColor.hex) {
                throw new Error("Invalid color type: hex");
            }
            return calcHexColor(baseColor.hex, { lightness, saturation, alpha }, options);
    }
}

export function attachColor(
    baseColor: Color, 
    hslOptions: ColorHSLOptions,
    options: ColorOptions = {},
): Color {
    const { lightness, saturation, alpha } = hslOptions;
    switch (baseColor.type) {
        case "rgb":
            if (!baseColor.rgb) {
                throw new Error("Invalid color type: rgb");
            }
            return { 
                type: "rgb", 
                rgb: attachRgbColor(baseColor.rgb, { lightness, saturation, alpha }, options),
            };
        case "hsl":
            if (!baseColor.hsl) {
                throw new Error("Invalid color type: hsl");
            }
            return { 
                type: "hsl", 
                hsl: attachHslColor(baseColor.hsl, { lightness, saturation, alpha }, options),
            };
        case "hex":
            if (!baseColor.hex) {
                throw new Error("Invalid color type: hex");
            }
            return { 
                type: "hex", 
                hex: attachHexColor(baseColor.hex, { lightness, saturation, alpha }, options),
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

export function colorToRGB(
    color: Color,
    options: ColorOptions = {},
): RGBColor {
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
            return hslToRgb(color.hsl, options);
        case "hex":
            if (!color.hex) {
                throw new Error("Invalid color type: hex");
            }
            return hexToRgb(color.hex, 1, options);
    }
}

export function colorToHSL(
    color: Color,
    options: ColorOptions = {},
): HSLColor {
    switch (color.type) {
        case "rgb":
            if (!color.rgb) {
                throw new Error("Invalid color type: rgb");
            }
            return rgbToHsl(color.rgb, options);
        case "hsl":
            if (!color.hsl) {
                throw new Error("Invalid color type: hsl");
            }
            return color.hsl;
        case "hex":
            if (!color.hex) {
                throw new Error("Invalid color type: hex");
            }
            return rgbToHsl(hexToRgb(color.hex, 1, options), options);
    }
}

export function colorToHex(
    color: Color,
    options: ColorOptions = {},
): string {
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
            return hslToHex(color.hsl, options);
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
    options: ColorOptions = {},
): string {
    switch (typeof color) {
        case "string":
            switch (to) {
                case "rgb":
                    return colorToString(hexToRgb(color, alpha, options), "rgb");
                case "hsl":
                    return colorToString(hexToHsl(color, alpha, options), "hsl");
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
                        return colorToString(rgbToHsl(color, options), "hsl");
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
                        return colorToString(hslToRgb(color, options), "rgb");
                    case "hex":
                        return colorToString(hslToHex(color, options), "hex");
                    case "hsl":
                    default:
                        return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${color.a})`;
                }
            }
            throw new Error("Invalid color object");
    }
}