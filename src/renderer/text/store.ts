import { createSignal } from "solid-js";
import { DefaultFlexibleTextStyles, NullableFlexibleTextStyles } from "./type";

export const [textRefMap, setTextRefMap] = createSignal<Map<string, HTMLDivElement>>(new Map());

export const [editableTextRef, setEditableTextRef] = createSignal<{
    elm: HTMLDivElement,
    id: string,
    newSelected: boolean,
} | null>(null);
export const [editableTextCursor, setEditableTextCursor] = createSignal<number | Range | null>(null);

export const [currentStyle, setCurrentStyle] = createSignal<{
    style: NullableFlexibleTextStyles,
    selectType: "cursor" | "range" | "none",
    from: "topBar" | "none" | string, // textZoneId
}>({
    style: DefaultFlexibleTextStyles,
    selectType: "cursor",
    from: "none",
});