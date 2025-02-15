import { FlexibleText, FlexibleTextStyles } from "./types";

export const FlexibleTextTypes = {
    TEXT: "text",
} as const;

export const DefaultFlexibleTextStyles: FlexibleTextStyles = {
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    fontColor: "",
    highlightColor: "",
    fontSize: 16,
    fontFamily: "Arial",
    verticalAlign: "sub",
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
        verticalAlign: DefaultFlexibleTextStyles.verticalAlign,
    };
};