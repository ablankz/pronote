import { BlockComponentType, BlockTypes } from "./type";

export const minPercentage = 0, maxPercentage = 100;
export const minPx = 0;
export const percentagePrecision = 2, pxPrecision = 1;

export const componentLists: BlockComponentType[] = [
    {
        key: "empty",
        type: BlockTypes.EMPTY,
        display: "Empty",
        displayWithEmoji: "🪟Empty",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "text",
        type: BlockTypes.TEXT,
        display: "Text",
        displayWithEmoji: "📝Text",
        widthInitialSizeValue: {
            value: 50,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 128,
            unit: "px",
            auto: false
        }
    },
    {
        key: "image",
        type: BlockTypes.IMAGE,
        display: "Image",
        displayWithEmoji: "🖼️Image",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "video",
        type: BlockTypes.VIDEO,
        display: "Video",
        displayWithEmoji: "🎥Video",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "button",
        type: BlockTypes.BUTTON,
        display: "Button",
        displayWithEmoji: "🔘Button",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "slider",
        type: BlockTypes.SLIDER,
        display: "Slider",
        displayWithEmoji: "🎚️Slider",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "gallery",
        type: BlockTypes.GALLERY,
        display: "Gallery",
        displayWithEmoji: "🖼️Gallery",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "map",
        type: BlockTypes.MAP,
        display: "Map",
        displayWithEmoji: "🗺️Map",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "form",
        type: BlockTypes.FORM,
        display: "Form",
        displayWithEmoji: "📝Form",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "social",
        type: BlockTypes.SOCIAL,
        display: "Social",
        displayWithEmoji: "👥Social",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "feed",
        type: BlockTypes.FEED,
        display: "Feed",
        displayWithEmoji: "📰Feed",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "list",
        type: BlockTypes.LIST,
        display: "List",
        displayWithEmoji: "📃List",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "table",
        type: BlockTypes.TABLE,
        display: "Table",
        displayWithEmoji: "📊Table",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "file",
        type: BlockTypes.FILE,
        display: "File",
        displayWithEmoji: "📁File",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "code",
        type: BlockTypes.CODE,
        display: "Code",
        displayWithEmoji: "💻Code",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "html",
        type: BlockTypes.HTML,
        display: "HTML",
        displayWithEmoji: "🔗HTML",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "iframe",
        type: BlockTypes.IFRAME,
        display: "Iframe",
        displayWithEmoji: "🖼️Iframe",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "embed",
        type: BlockTypes.EMBED,
        display: "Embed",
        displayWithEmoji: "🔗Embed",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "navbar",
        type: BlockTypes.NAVBAR,
        display: "Navbar",
        displayWithEmoji: "🧭Navbar",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "footer",
        type: BlockTypes.FOOTER,
        display: "Footer",
        displayWithEmoji: "🦶Footer",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "header",
        type: BlockTypes.HEADER,
        display: "Header",
        displayWithEmoji: "📜Header",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
    {
        key: "section",
        type: BlockTypes.SECTION,
        display: "Section",
        displayWithEmoji: "🔖Section",
        widthInitialSizeValue: {
            value: 80,
            unit: "%",
            auto: false
        },
        heightInitialSizeValue: {
            value: 196,
            unit: "px",
            auto: false
        }
    },
];