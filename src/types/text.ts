export interface FlexibleText {
    id: string;
    version: number;
    text: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikeThrough: boolean;
    color: string;
    fontSize: number;
    fontFamily: string;
}

export const DefaultFlexibleText = (id: string): FlexibleText => {
    return {
        id: id,
        version: 0,
        text: "",
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
        color: "",
        fontSize: 16,
        fontFamily: "Arial",
    };
};
