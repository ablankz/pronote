export const FlexibleTextTypes = {
    TEXT: "text"
} as const;

export type FlexibleTextType = typeof FlexibleTextTypes[keyof typeof FlexibleTextTypes];

export interface FlexibleTextStyles {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikeThrough: boolean;
    fontColor: string;
    highlightColor: string;
    fontSize: number;
    fontFamily: string;
}

export const DefaultFlexibleTextStyles: FlexibleTextStyles = {
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    fontColor: "",
    highlightColor: "",
    fontSize: 16,
    fontFamily: "Arial",
}

export function equalFlexibleTextStyles(a: FlexibleTextStyles, b: FlexibleTextStyles): boolean {
    return a.bold === b.bold &&
        a.italic === b.italic &&
        a.underline === b.underline &&
        a.strikeThrough === b.strikeThrough &&
        a.fontColor === b.fontColor &&
        a.highlightColor === b.highlightColor &&
        a.fontSize === b.fontSize &&
        a.fontFamily === b.fontFamily;
}

export interface FlexibleText extends FlexibleTextStyles {
    type: FlexibleTextType;
    id: string;
    version: number;
    text: string;
}

export function extractStyleFromFlexibleText(flexibleText: FlexibleText): FlexibleTextStyles {
    return {
        bold: flexibleText.bold,
        italic: flexibleText.italic,
        underline: flexibleText.underline,
        strikeThrough: flexibleText.strikeThrough,
        fontColor: flexibleText.fontColor,
        highlightColor: flexibleText.highlightColor,
        fontSize: flexibleText.fontSize,
        fontFamily: flexibleText.fontFamily,
    };
}

export const DefaultFlexibleText = (id: string): FlexibleText => {
    return {
        type: FlexibleTextTypes.TEXT,
        id: id,
        version: 0,
        text: "",
        bold: DefaultFlexibleTextStyles.bold,
        italic: DefaultFlexibleTextStyles.italic,
        underline: DefaultFlexibleTextStyles.underline,
        strikeThrough: DefaultFlexibleTextStyles.strikeThrough,
        fontColor: DefaultFlexibleTextStyles.fontColor,
        highlightColor: DefaultFlexibleTextStyles.highlightColor,
        fontSize: DefaultFlexibleTextStyles.fontSize,
        fontFamily: DefaultFlexibleTextStyles.fontFamily,
    };
};
