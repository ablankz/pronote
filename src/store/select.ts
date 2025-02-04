import { createSignal } from "solid-js";
import { ComponentBlock } from "../types/block";

export interface SelectedBlockValue {
    component: ComponentBlock;
}

export const [selectedBlock, setSelectedBlock] = createSignal<SelectedBlockValue | null>(null);