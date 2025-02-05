import { createSignal } from "solid-js";
import { DefaultFlexibleText } from "../types/text";

export const [detailOpen, setDetailOpen] = createSignal(false);

export const [currentStyle, setCurrentStyle] = createSignal(DefaultFlexibleText);

export const [globalCursorAction, setGlobalCursorAction] = createSignal<boolean>(false);