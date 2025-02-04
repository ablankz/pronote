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

export interface FlexibleTextBlock {
    text: FlexibleText[];
}