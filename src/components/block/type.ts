export interface ResizeBlockProps {
    resizing: boolean;
    resizerId: string;
    direction: "right" | "bottom" | "corner";
}

export interface AddOpenState {
    open: boolean;
    id: string;
}

const unitArray = ['%', 'px'] as const;

export type SizeUnit = typeof unitArray[number];
export const SIZE_UNITS = unitArray;

export interface SizeValue {
    value: number;
    unit: SizeUnit;
    auto: boolean;
}

export const BlockTypes = {
    EMPTY: "empty",
    TEXT: "text",
    IMAGE: "image",
    VIDEO: "video",
    BUTTON: "button",
    SLIDER: "slider",
    GALLERY: "gallery",
    MAP: "map",
    FORM: "form",
    SOCIAL: "social",
    FEED: "feed",
    LIST: "list",
    TABLE: "table",
    FILE: "file",
    CODE: "code",
    HTML: "html",
    IFRAME: "iframe",
    EMBED: "embed",
    NAVBAR: "navbar",
    FOOTER: "footer",
    HEADER: "header",
    SECTION: "section",
    CONTAINER: "container",
    ROW: "row",
    COLUMN: "column",
    SPACER: "spacer",
    DIVIDER: "divider",
    ACCORDION: "accordion",
    TABS: "tabs"
} as const;

export type BlockType = (typeof BlockTypes)[keyof typeof BlockTypes];

export type BlockComponentType = {
    key: string;
    type: BlockType;
    display: string;
    displayWithEmoji: string;
    widthInitialSizeValue: SizeValue;
    heightInitialSizeValue: SizeValue;
}

export interface ComponentBlock {
    id: string;
    type: BlockType;
    data: any;
    widthInitialSizeValue: SizeValue;
    heightInitialSizeValue: SizeValue;
}