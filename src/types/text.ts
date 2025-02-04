export interface FlexibleText {
    text: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikeThrough: boolean;
    color: string;
    fontSize: number;
    fontFamily: string;
}

export const DefaultFlexibleText: FlexibleText = {
    text: "",
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    color: "",
    fontSize: 16,
    fontFamily: "Arial",
};
