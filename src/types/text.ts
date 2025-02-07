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

export interface FlexibleText extends FlexibleTextStyles {
    type: FlexibleTextType;
    id: string;
    version: number;
    text: string;
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
