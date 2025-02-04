import { createSignal } from "solid-js";

export const [detailOpen, setDetailOpen] = createSignal(false);

export const [globalCursorAction, setGlobalCursorAction] = createSignal<boolean>(false);