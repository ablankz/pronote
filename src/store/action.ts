import { createSignal } from "solid-js";
import { DefaultFlexibleTextStyles } from "../types/text";

export const [detailOpen, setDetailOpen] = createSignal(false);

export const [currentStyle, setCurrentStyle] = createSignal(DefaultFlexibleTextStyles);

export const [globalCursorAction, setGlobalCursorAction] = createSignal<boolean>(false);