import { JSXElement } from "solid-js";


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
    // BASIC
    SUB_PAGE: "sub-page",
    CONTAINER: "container",
    BULLETED_LIST: "bulleted-list",
    NUMBERED_LIST: "numbered-list",
    CHECKBOX_LIST: "checkbox-list",
    TABLE: "table",
    
    // TEXT
    PARAGRAPH: "paragraph",
    HEADER: "header",
    QUOTE: "quote",
    MATH_EQUATION: "math-equation",
    CODE_BLOCK: "code-block",
    
    // MEDIA
    IMAGE: "image",
    VIDEO: "video",
    MAP: "map",
    EXTERNAL_LINK: "external-link",
    EMBED_LINK: "embed-link",
    AUDIO: "audio",
    FILE: "file",
    SOCIAL: "social",
    
    // ACTION
    BUTTON: "button",
    FORM: "form",
    INPUT: "input",
    SELECT: "select",
    CHECKBOX: "checkbox",
    RADIO: "radio",
    SWITCH: "switch",
    SLIDER: "slider",
    DATE_PICKER: "date-picker",
    TIME_PICKER: "time-picker",
    UPLOAD: "upload",
    DOWNLOAD: "download",
    DROPDOWN: "dropdown",

    // LAYOUT
    SPACER: "spacer",
    DIVIDER: "divider",
    GRID: "grid",
    TABS: "tabs",
    ACCORDION: "accordion",
    CAROUSEL: "carousel",

    // DATA_VIEWS
    CHART_VIEW: "chart-view",
    TABLE_VIEW: "table-view",
    CALENDAR_VIEW: "calendar-view",
    KANBAN_VIEW: "kanban-view",

    // COLLABORATION
    VOTING: "voting",
    KANBAN_BOARD: "kanban-board",
    Q_AND_A: "q-and-a",
    COMMENTS: "comments",
} as const;

export type BlockType = (typeof BlockTypes)[keyof typeof BlockTypes];

export const BlockTypeCategories = {
    BASIC: "Basic",
    TEXT: "Text",
    MEDIA: "Media",
    ACTION: "Action",
    LAYOUT: "Layout",
    DATA_VIEWS: "Data Views",
    COLLABORATION: "Collaboration",
} as const;

export type BlockTypeCategory = (typeof BlockTypeCategories)[keyof typeof BlockTypeCategories];

export type BlockComponentType = {
    key: string;
    type: BlockType;
    category: BlockTypeCategory;
    icon: JSXElement;
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