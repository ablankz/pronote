import { FlexibleTextTypes } from "./const";

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
    verticalAlign: string;
    fontScale: number;
}

export type NullableFlexibleTextStyles = Partial<FlexibleTextStyles>;

export interface FlexibleText extends FlexibleTextStyles {
    type: FlexibleTextType;
    id: string;
    version: number;
    text: string;
}
