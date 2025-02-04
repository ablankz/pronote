export interface ResizeBlockProps {
    resizing: boolean;
    resizerId: string;
    direction: "right" | "bottom" | "corner";
}

const unitArray = ['%', 'px'] as const;

export type SizeUnit = typeof unitArray[number];
export const SIZE_UNITS = unitArray;

export interface SizeValue {
    value: number;
    unit: SizeUnit;
    auto: boolean;
}