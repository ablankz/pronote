import { BlockType, BlockTypes } from "../../renderer/types";

export const TextZonePrefixes = {
    BLOCK_PARAGRAPH: "block-paragraph:",
} as const;

export type TextZonePrefix = typeof TextZonePrefixes[keyof typeof TextZonePrefixes];

export type TextValidComponentsMapType = {
    [key in BlockType]?: TextZonePrefix;
}

export const TextValidComponentsMap: TextValidComponentsMapType = {
    [BlockTypes.PARAGRAPH]: TextZonePrefixes.BLOCK_PARAGRAPH,
} as const;