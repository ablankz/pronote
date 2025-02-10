import { createSignal } from "solid-js";

export const [textRefMap, setTextRefMap] = createSignal<Map<string, HTMLDivElement>>(new Map());