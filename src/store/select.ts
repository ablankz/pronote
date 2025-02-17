import { createSignal } from "solid-js";
import { ComponentBlock } from "../renderer/types";

export interface SelectedBlockValue {
    component: ComponentBlock;
}

export const [selectedBlock, setSelectedBlock] = createSignal<SelectedBlockValue | null>(null);