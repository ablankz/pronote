import { createSignal } from "solid-js";
import { BlockDetailValue } from "../components/block/type";

export const [detailSelected, setDetailSelected] = createSignal<BlockDetailValue | null>(null);