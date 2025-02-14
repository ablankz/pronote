import { DefaultFlexibleTextStyles } from "./const";
import { 
    FlexibleText, 
    FlexibleTextStyles, 
    NullableFlexibleTextStyles 
} from "./types";

export function nullableToDefaultFlexibleTextStyles(
    nullable: NullableFlexibleTextStyles | undefined,
): FlexibleTextStyles {
    return {
        bold: nullable?.bold ?? DefaultFlexibleTextStyles.bold,
        italic: nullable?.italic ?? DefaultFlexibleTextStyles.italic,
        underline: nullable?.underline ?? DefaultFlexibleTextStyles.underline,
        strikeThrough: nullable?.strikeThrough ?? DefaultFlexibleTextStyles.strikeThrough,
        fontColor: nullable?.fontColor ?? DefaultFlexibleTextStyles.fontColor,
        highlightColor: nullable?.highlightColor ?? DefaultFlexibleTextStyles.highlightColor,
        fontSize: nullable?.fontSize ?? DefaultFlexibleTextStyles.fontSize,
        fontFamily: nullable?.fontFamily ?? DefaultFlexibleTextStyles.fontFamily,
    };
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

export function equalOverrideFlexibleTextStyles(
    a: FlexibleTextStyles | NullableFlexibleTextStyles, 
    b: FlexibleTextStyles | NullableFlexibleTextStyles,
): NullableFlexibleTextStyles {
    return {
        bold: a.bold === b.bold ? a.bold : undefined,
        italic: a.italic === b.italic ? a.italic : undefined,
        underline: a.underline === b.underline ? a.underline : undefined,
        strikeThrough: a.strikeThrough === b.strikeThrough ? a.strikeThrough : undefined,
        fontColor: a.fontColor === b.fontColor ? a.fontColor : undefined,
        highlightColor: a.highlightColor === b.highlightColor ? a.highlightColor : undefined,
        fontSize: a.fontSize === b.fontSize ? a.fontSize : undefined,
        fontFamily: a.fontFamily === b.fontFamily ? a.fontFamily : undefined,
    };
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