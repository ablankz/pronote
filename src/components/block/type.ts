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

interface BlockType {
    id: string;
    name: string;
    icon: string;
    component: any;
    defaultData: any;
    render: any;
}

enum BlockTypes {
    TEXT = "text",
    IMAGE = "image",
    VIDEO = "video",
    BUTTON = "button",
    SLIDER = "slider",
    GALLERY = "gallery",
    MAP = "map",
    FORM = "form",
    SOCIAL = "social",
    FEED = "feed",
    LIST = "list",
    TABLE = "table",
    FILE = "file",
    CODE = "code",
    HTML = "html",
    IFRAME = "iframe",
    EMBED = "embed",
    NAVBAR = "navbar",
    FOOTER = "footer",
    HEADER = "header",
    SECTION = "section",
    CONTAINER = "container",
    ROW = "row",
    COLUMN = "column",
    SPACER = "spacer",
    DIVIDER = "divider",
    ACCORDION = "accordion",
    TABS = "tabs"
}

export interface ComponentBlock {
    id: string;
    type: string;
    data: any;
}