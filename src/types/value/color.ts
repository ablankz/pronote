export const ColorTypes = {
    HEX: "hex",
    RGB: "rgb",
    HSL: "hsl",
    TRANSPARENT: "transparent",
    KEYWORD: "keyword",
} as const;

export type ColorType = typeof ColorTypes[keyof typeof ColorTypes];

export type ColorHexData = {
    hex: string;
    alpha?: string;
};

export type ColorRGBData = {
    r: number;
    g: number;
    b: number;
    alpha?: number;
};

export type ColorHSLData = {
    h: number;
    s: number;
    l: number;
    alpha?: number;
};

export type ColorKeywordData = {
    value: string;
};

export interface ColorValues {
    type: ColorType;
    hex?: ColorHexData;
    rgb?: ColorRGBData;
    hsl?: ColorHSLData;
    keyword?: ColorKeywordData;
}

export class ColorValueFactory {
    _data: ColorValues;

    constructor(type: ColorType, data: {
        hex?: ColorHexData,
        rgb?: ColorRGBData,
        hsl?: ColorHSLData,
        keyword?: ColorKeywordData
    }) {
        this._data = {
            type: type
        }
        switch (type) {
            case ColorTypes.HEX:
                this._data.hex = data.hex;
                break;
            case ColorTypes.RGB:
                this._data.rgb = data.rgb;
                break;
            case ColorTypes.HSL:
                this._data.hsl = data.hsl;
                break;
            case ColorTypes.KEYWORD:
                this._data.keyword = data.keyword;
                break;
            case ColorTypes.TRANSPARENT:
                break;
            default:
                throw new Error("Invalid color type");
        }
    }

    static fromHex(data: ColorHexData): ColorValueFactory {
        return new ColorValueFactory(ColorTypes.HEX, { hex: data });
    }

    static fromRGB(data: ColorRGBData): ColorValueFactory {
        return new ColorValueFactory(ColorTypes.RGB, { rgb: data });
    }

    static fromHSL(data: ColorHSLData): ColorValueFactory {
        return new ColorValueFactory(ColorTypes.HSL, { hsl: data });
    }

    static fromKeyword(data: ColorKeywordData): ColorValueFactory {
        return new ColorValueFactory(ColorTypes.KEYWORD, { keyword: data });
    }

    static transparent(): ColorValueFactory {
        return new ColorValueFactory(ColorTypes.TRANSPARENT, {});
    }

    static parseHexStr(color: string): ColorHexData {
        let c = color.trim();
        if (c.startsWith("#")) {
            c = c.slice(1);
        }
        
        if (c.length === 3) {
            return {
                hex: `#${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`,
                alpha: "ff"
            };
        } else if (c.length === 4) {
            return {
                hex: `#${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`,
                alpha: `${c[3]}${c[3]}`
            };
        } else if (c.length === 6) {
            return { hex: `#${c}`, alpha: "ff" };
        } else if (c.length === 8) {
            return { hex: `#${c.slice(0, 6)}`, alpha: c.slice(6) };
        } else {
            throw new Error("Invalid background-color format");
        }
    }      

    static fromString(color: string, type?: ColorType): ColorValueFactory {
        if (type) {
            switch (type) {
                case ColorTypes.HEX:
                    return ColorValueFactory.fromHex(ColorValueFactory.parseHexStr(color));
                case ColorTypes.RGB:
                    const match = color.match(/rgba?\((\d+), (\d+), (\d+)(, (\d+(\.\d+)?))?\)/);
                    if (!match) {
                        throw new Error("Invalid color string");
                    }
                    if (match[4]) {
                        return ColorValueFactory.fromRGB({
                            r: parseInt(match[1]),
                            g: parseInt(match[2]),
                            b: parseInt(match[3]),
                            alpha: parseFloat(match[5])
                        });
                    }
                    return ColorValueFactory.fromRGB({
                        r: parseInt(match[1]),
                        g: parseInt(match[2]),
                        b: parseInt(match[3])
                    });
                case ColorTypes.HSL:
                    const match2 = color.match(/hsla?\((\d+), (\d+)%, (\d+)%(, (\d+(\.\d+)?))?\)/);
                    if (!match2) {
                        throw new Error("Invalid color string");
                    }
                    if (match2[4]) {
                        return ColorValueFactory.fromHSL({
                            h: parseInt(match2[1]),
                            s: parseInt(match2[2]),
                            l: parseInt(match2[3]),
                            alpha: parseFloat(match2[5])
                        });
                    }
                    return ColorValueFactory.fromHSL({
                        h: parseInt(match2[1]),
                        s: parseInt(match2[2]),
                        l: parseInt(match2[3])
                    });
                case ColorTypes.KEYWORD:
                    return ColorValueFactory.fromKeyword({ value: color });
                case ColorTypes.TRANSPARENT:
                    return ColorValueFactory.transparent();
                default:
                    throw new Error("Invalid color type");
            }
        }
        if (color === "transparent") {
            return ColorValueFactory.transparent();
        }
        if (color.startsWith("#")) {
            return ColorValueFactory.fromHex(ColorValueFactory.parseHexStr(color));
        }
        if (color.startsWith("rgb")) {
            const match = color.match(/rgba?\((\d+), (\d+), (\d+)(, (\d+(\.\d+)?))?\)/);
            if (!match) {
                throw new Error("Invalid color string");
            }
            if (match[4]) {
                return ColorValueFactory.fromRGB({
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3]),
                    alpha: parseFloat(match[5])
                });
            }
            return ColorValueFactory.fromRGB({
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            });
        }
        if (color.startsWith("hsl")) {
            const match = color.match(/hsla?\((\d+), (\d+)%, (\d+)%(, (\d+(\.\d+)?))?\)/);
            if (!match) {
                throw new Error("Invalid color string");
            }
            if (match[4]) {
                return ColorValueFactory.fromHSL({
                    h: parseInt(match[1]),
                    s: parseInt(match[2]),
                    l: parseInt(match[3]),
                    alpha: parseFloat(match[5])
                });
            }
            return ColorValueFactory.fromHSL({
                h: parseInt(match[1]),
                s: parseInt(match[2]),
                l: parseInt(match[3])
            });
        }
        return ColorValueFactory.fromKeyword({ value: color });
    }

    static toString(color: ColorValues|undefined): string|undefined {
        if (!color) {
            return undefined;
        }
        switch (color.type) {
            case ColorTypes.HEX:
                return `${color.hex?.hex}${color.hex?.alpha}`;
            case ColorTypes.RGB:
                if (color.rgb?.alpha !== undefined) {
                    return `rgba(${color.rgb?.r}, ${color.rgb?.g}, ${color.rgb?.b}, ${color.rgb?.alpha})`;
                }
                return `rgb(${color.rgb?.r}, ${color.rgb?.g}, ${color.rgb?.b})`;
            case ColorTypes.HSL:
                if (color.hsl?.alpha !== undefined) {
                    return `hsla(${color.hsl?.h}, ${color.hsl?.s}%, ${color.hsl?.l}%, ${color.hsl?.alpha})`;
                }
                return `hsl(${color.hsl?.h}, ${color.hsl?.s}%, ${color.hsl?.l}%)`;
            case ColorTypes.KEYWORD:
                return color.keyword?.value || "";
            case ColorTypes.TRANSPARENT:
                return "transparent";
            default:
                return "";
        }
    }

    toString(): string|undefined {
        return ColorValueFactory.toString(this._data);
    }

    get data(): ColorValues {
        return this._data;
    }
}