import { StateBaseType } from "./base";

export type StateID = string;

export const StateStructureTypes = {
    SINGLE: "single",
    ARRAY: "array",
    RECORD: "record",
    MAP: "map",
    SET: "set",
    STACK: "stack",
    QUEUE: "queue",
    LINKED_LIST: "linked-list",
    TREE: "tree",
    GRAPH: "graph",
} as const;

export type StateStructureType = (typeof StateStructureTypes)[keyof typeof StateStructureTypes];

export type StateVariable = {
    id: StateID;
    type: StateBaseType;
    name: string;
}

export type StateStringVariable = StateVariable & {
    value: string;
}

