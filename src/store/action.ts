import { createSignal } from "solid-js";
import { DefaultFlexibleTextStyles, NullableFlexibleTextStyles } from "../types/text";
import { Range } from "../types/generic";

export const [detailOpen, setDetailOpen] = createSignal(false);

export const [currentStyle, setCurrentStyle] = createSignal<{
    style: NullableFlexibleTextStyles,
    selectType: "cursor" | "range" | "none",
    from: "topBar" | "none" | string,
}>({
    style: DefaultFlexibleTextStyles,
    selectType: "cursor",
    from: "none",
});

export const [globalCursorAction, setGlobalCursorAction] = createSignal<boolean>(false);

export const [editableTextRef, setEditableTextRef] = createSignal<{
    elm: HTMLDivElement,
    id: string,
    newSelected: boolean,
 } | null>(null);
export const [editableTextCursor, setEditableTextCursor] = createSignal<number | Range | null>(null);