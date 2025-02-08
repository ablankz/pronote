import { createSignal } from "solid-js";
import { DefaultFlexibleTextStyles } from "../types/text";
import { Range } from "../types/generic";

export const [detailOpen, setDetailOpen] = createSignal(false);

export const [currentStyle, setCurrentStyle] = createSignal(DefaultFlexibleTextStyles);

export const [globalCursorAction, setGlobalCursorAction] = createSignal<boolean>(false);

export const [editableTextRef, setEditableTextRef] = createSignal<HTMLDivElement | null>(null);
export const [editableTextCursor, setEditableTextCursor] = createSignal<number | Range | null>(null);
export const [editableActionIgnore, setEditableActionIgnore] = createSignal<boolean>(false);