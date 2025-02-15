import { createSignal } from "solid-js";
import { NullableFlexibleTextStyles } from "../../renderer/text/types";
import { DefaultFlexibleTextStyles } from "../../renderer/text/const";

export const [textRefMap, setTextRefMap] = createSignal<Map<string, HTMLElement>>(new Map());

export const [editableTextRef, setEditableTextRef] = createSignal<{
    elm: HTMLElement,
    id: string,
    newSelected: boolean,
} | null>(null);

export const [currentStyle, setCurrentStyle] = createSignal<{
    style: NullableFlexibleTextStyles,
    selectType: "cursor" | "range" | "none",
    from: "setter" | "none" | string, // textZoneId
}>({
    style: DefaultFlexibleTextStyles,
    selectType: "cursor",
    from: "none",
});

export const [rangeFontColorStyleUpdate, setRangeFontColorStyleUpdate] = createSignal<{
    id: string,
    color?: string,
} | null>(null);
export const [rangeHighlightColorStyleUpdate, setRangeHighlightColorStyleUpdate] = createSignal<{
    id: string,
    color?: string,
} | null>(null);
export const [rangeFontSizeStyleUpdate, setRangeFontSizeStyleUpdate] = createSignal<{
    id: string,
    type: "specific" | "update",
    size?: number,
} | null>(null);
export const [rangeFontFamilyStyleUpdate, setRangeFontFamilyStyleUpdate] = createSignal<{
    id: string,
    fontFamily?: string,
} | null>(null);
export const [rangeFontBoldStyleUpdate, setRangeFontBoldStyleUpdate] = createSignal<{
    id: string,
    type: "specific" | "toggle" | "nearTrue",
    bold?: boolean,
    allTrue?: boolean,
} | null>(null);
export const [rangeFontItalicStyleUpdate, setRangeFontItalicStyleUpdate] = createSignal<{
    id: string,
    type: "specific" | "toggle" | "nearTrue",
    italic?: boolean,
    allTrue?: boolean,
} | null>(null);
export const [rangeFontUnderlineStyleUpdate, setRangeFontUnderlineStyleUpdate] = createSignal<{
    id: string,
    type: "specific" | "toggle" | "nearTrue",
    underline?: boolean,
    allTrue?: boolean,
} | null>(null);
export const [rangeFontStrikeThroughStyleUpdate, setRangeFontStrikeThroughStyleUpdate] = createSignal<{
    id: string,
    type: "specific" | "toggle" | "nearTrue",
    strikeThrough?: boolean,
    allTrue?: boolean,
} | null>(null);