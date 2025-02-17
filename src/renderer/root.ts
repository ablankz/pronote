import { BlockType } from "./types";

export type DocumentRoot = {
    version: string;
    components: Component[];
    events: Event[];
    data: Data[];
}

export type Component = {
    type: BlockType;
}

export type Event = {}

export type Data = {}