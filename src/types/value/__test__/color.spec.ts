import { 
    ColorTypes, 
    ColorValueFactory 
} from "../color";

describe("CFaColorValueFactoryConverter", () => {
    test("fromHex and toString (length: 6)", () => {
        const factory = ColorValueFactory.fromHex({ hex: "#bbff00", alpha: "ff" });
        expect(factory.toString()).toBe("#bbff00ff");
    });

    test("parseHexStr and fromHex (length: 3)", () => {
        const parsed = ColorValueFactory.parseHexStr("#bf0");
        expect(parsed).toEqual({ hex: "#bbff00", alpha: "ff" });
        const factory = ColorValueFactory.fromHex(parsed);
        expect(factory.toString()).toBe("#bbff00ff");
    });

    test("parseHexStr and fromHex (length: 8)", () => {
        const parsed = ColorValueFactory.parseHexStr("#11ffee00");
        expect(parsed).toEqual({ hex: "#11ffee", alpha: "00" });
        const factory = ColorValueFactory.fromHex(parsed);
        expect(factory.toString()).toBe("#11ffee00");
    });

    test("parseHexStr and fromHex (length: 4)", () => {
        const parsed = ColorValueFactory.parseHexStr("#1fe0");
        expect(parsed).toEqual({ hex: "#11ffee", alpha: "00" });
        const factory = ColorValueFactory.fromHex(parsed);
        expect(factory.toString()).toBe("#11ffee00");
    });

    test("parseHexStr and fromHex (without #)", () => {
        const parsed = ColorValueFactory.parseHexStr("1fe0");
        expect(parsed).toEqual({ hex: "#11ffee", alpha: "00" });
        const factory = ColorValueFactory.fromHex(parsed);
        expect(factory.toString()).toBe("#11ffee00");
    });

    test("fromRGB and toString (without alpha)", () => {
        const factory = ColorValueFactory.fromRGB({ r: 255, g: 0, b: 127 });
        expect(factory.toString()).toBe("rgb(255, 0, 127)");
    });

    test("fromRGB and toString (with alpha)", () => {
        const factory = ColorValueFactory.fromRGB({ r: 255, g: 0, b: 127, alpha: 0.5 });
        expect(factory.toString()).toBe("rgba(255, 0, 127, 0.5)");
    });

    test("fromHSL and toString (without alpha)", () => {
        const factory = ColorValueFactory.fromHSL({ h: 120, s: 100, l: 50 });
        expect(factory.toString()).toBe("hsl(120, 100%, 50%)");
    });

    test("fromHSL and toString (with alpha)", () => {
        const factory = ColorValueFactory.fromHSL({ h: 120, s: 100, l: 50, alpha: 0.3 });
        expect(factory.toString()).toBe("hsla(120, 100%, 50%, 0.3)");
    });

    test("fromKeyword and toString", () => {
        const factory = ColorValueFactory.fromKeyword({ value: "red" });
        expect(factory.toString()).toBe("red");
    });

    test("transparent toString", () => {
        const factory = ColorValueFactory.transparent();
        expect(factory.toString()).toBe("transparent");
    });

    test("fromString with HEX specified", () => {
        const factory = ColorValueFactory.fromString("#bf0", ColorTypes.HEX);
        expect(factory.toString()).toBe("#bbff00ff");
    });

    test("fromString with HEX specified (without type)", () => {
        const factory = ColorValueFactory.fromString("#bf0");
        expect(factory.toString()).toBe("#bbff00ff");
    });

    test("fromString with RGB specified (rgb form)", () => {
        const factory = ColorValueFactory.fromString("rgb(255, 255, 255)", ColorTypes.RGB);
        expect(factory.toString()).toBe("rgb(255, 255, 255)");
    });

    test("fromString with RGB specified (rgb form), (without type)", () => {
        const factory = ColorValueFactory.fromString("rgb(255, 255, 255)");
        expect(factory.toString()).toBe("rgb(255, 255, 255)");
    });

    test("fromString with RGB specified (rgba form)", () => {
        const factory = ColorValueFactory.fromString("rgba(255, 255, 255, 0.5)", ColorTypes.RGB);
        expect(factory.toString()).toBe("rgba(255, 255, 255, 0.5)");
    });

    test("fromString with RGB specified (rgba form), (without type)", () => {
        const factory = ColorValueFactory.fromString("rgba(255, 255, 255, 0.5)");
        expect(factory.toString()).toBe("rgba(255, 255, 255, 0.5)");
    });

    test("fromString with HSL specified (hsl form)", () => {
        const factory = ColorValueFactory.fromString("hsl(0, 100%, 50%)", ColorTypes.HSL);
        expect(factory.toString()).toBe("hsl(0, 100%, 50%)");
    });

    test("fromString with HSL specified (hsl form), (without type)", () => {
        const factory = ColorValueFactory.fromString("hsl(0, 100%, 50%)");
        expect(factory.toString()).toBe("hsl(0, 100%, 50%)");
    });

    test("fromString with HSL specified (hsla form)", () => {
        const factory = ColorValueFactory.fromString("hsla(0, 100%, 50%, 0.75)", ColorTypes.HSL);
        expect(factory.toString()).toBe("hsla(0, 100%, 50%, 0.75)");
    });

    test("fromString with HSL specified (hsla form), (without type)", () => {
        const factory = ColorValueFactory.fromString("hsla(0, 100%, 50%, 0.75)");
        expect(factory.toString()).toBe("hsla(0, 100%, 50%, 0.75)");
    });

    test("fromString with transparent", () => {
        const factory = ColorValueFactory.fromString("transparent");
        expect(factory.toString()).toBe("transparent");
    });

    test("fromString with キーワード指定", () => {
        const factory = ColorValueFactory.fromString("blue");
        expect(factory.toString()).toBe("blue");
    });
});
