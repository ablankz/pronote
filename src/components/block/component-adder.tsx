import { createMemo, Setter } from "solid-js";
import AddComponentModal from "./add-component-modal";
import { AddOpenState } from "../../types/state";
import { BlockComponentType, BlockTypeCategories, BlockTypes } from "../../types/block";
import { 
    Activity,
    BookOpen, 
    BookText, 
    Box, 
    Calendar1, 
    CalendarDays, 
    ChartArea, 
    Check, 
    ChevronDown, 
    ChevronsDownUp, 
    CircleDot, 
    Clock, 
    Code, 
    Download, 
    ExternalLink, 
    File, 
    FileQuestion, 
    GalleryHorizontal, 
    Handshake, 
    Heading, 
    Image, 
    Kanban, 
    LayoutGrid, 
    Link, 
    List, 
    ListOrdered, 
    ListTodo, 
    MapPinned, 
    MessageCircle, 
    Minus, 
    MousePointerClick, 
    NotebookTabs, 
    PenLine, 
    Quote, 
    SlidersHorizontal, 
    Space, 
    SquareArrowDown, 
    SquareKanban, 
    SquareRadical, 
    Table, 
    TableProperties, 
    ToggleLeft, 
    Upload, 
    Video, 
    Vote, 
    WrapText
} from "lucide-solid";

interface ComponentAdderProps {
    addOpen: AddOpenState;
    setAddOpen: Setter<AddOpenState>;
    addModalRef: HTMLDivElement | undefined;
    addComponent: (id: string, componentType: BlockComponentType) => void;
}

export default function ComponentAdder(props: ComponentAdderProps) {
    const componentLists: BlockComponentType[] = [
        {
            key: "sub-page",
            type: BlockTypes.SUB_PAGE,
            category: BlockTypeCategories.BASIC,
            icon: (
                <BookOpen />
            ),
            display: "Sub Page",
            displayWithEmoji: "📖Sub Page",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            }
        },
        {
            key: "container",
            type: BlockTypes.CONTAINER,
            category: BlockTypeCategories.BASIC,
            icon: (
                <Box />
            ),
            display: "Container",
            displayWithEmoji: "📋Container",
            widthInitialSizeValue: {
                value: 100,
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
            key: "bulleted-list",
            type: BlockTypes.BULLETED_LIST,
            category: BlockTypeCategories.BASIC,
            icon: (
                <List />
            ),
            display: "Bulleted List",
            displayWithEmoji: "📝Bulleted List",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            }
        },
        {
            key: "numbered-list",
            type: BlockTypes.NUMBERED_LIST,
            category: BlockTypeCategories.BASIC,
            icon: (
                <ListOrdered />
            ),
            display: "Numbered List",
            displayWithEmoji: "🔢Numbered List",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            }
        },
        {
            key: "checkbox-list",
            type: BlockTypes.CHECKBOX_LIST,
            category: BlockTypeCategories.BASIC,
            icon: (
                <ListTodo />
            ),
            display: "Checkbox List",
            displayWithEmoji: "☑️Checkbox List",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            }
        },
        {
            key: "table",
            type: BlockTypes.TABLE,
            category: BlockTypeCategories.BASIC,
            icon: (
                <TableProperties />
            ),
            display: "Table",
            displayWithEmoji: "📊Table",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            }
        },
        {
            key: "paragraph",
            type: BlockTypes.PARAGRAPH,
            category: BlockTypeCategories.TEXT,
            icon: (
                <WrapText />
            ),
            display: "Paragraph",
            displayWithEmoji: "📝Paragraph",
            widthInitialSizeValue: {
                value: 90,
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
            key: "header",
            type: BlockTypes.HEADER,
            category: BlockTypeCategories.TEXT,
            icon: (
                <Heading />
            ),
            display: "Header",
            displayWithEmoji: "📰Header",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: true
            }
        },
        {
            key: "quote",
            type: BlockTypes.QUOTE,
            category: BlockTypeCategories.TEXT,
            icon: (
                <Quote />
            ),
            display: "Quote",
            displayWithEmoji: "💬Quote",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            }
        },
        {
            key: "math-equation",
            type: BlockTypes.MATH_EQUATION,
            category: BlockTypeCategories.TEXT,
            icon: (
                <SquareRadical />
            ),
            display: "Math Equation",
            displayWithEmoji: "➗Math Equation",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            }
        },
        {
            key: "code-block",
            type: BlockTypes.CODE_BLOCK,
            category: BlockTypeCategories.TEXT,
            icon: (
                <Code />
            ),
            display: "Code Block",
            displayWithEmoji: "💻Code Block",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            }
        },
    
        {
            key: "image",
            type: BlockTypes.IMAGE,
            category: BlockTypeCategories.MEDIA,
            icon: (
                <Image />
            ),
            display: "Image",
            displayWithEmoji: "🖼️Image",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "video",
            type: BlockTypes.VIDEO,
            category: BlockTypeCategories.MEDIA,
            icon: (
                <Video />
            ),
            display: "Video",
            displayWithEmoji: "🎥Video",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "map",
            type: BlockTypes.MAP,
            category: BlockTypeCategories.MEDIA,
            icon: (
                <MapPinned />
            ),
            display: "Map",
            displayWithEmoji: "🗺️Map",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "external-link",
            type: BlockTypes.EXTERNAL_LINK,
            category: BlockTypeCategories.MEDIA,
            icon: (
                <ExternalLink />
            ),
            display: "Link",
            displayWithEmoji: "🔗Link",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "embed-link",
            type: BlockTypes.EMBED_LINK,
            category: BlockTypeCategories.MEDIA,
            icon: (
                <Link />
            ),
            display: "Embed Link",
            displayWithEmoji: "🔗Embed Link",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "audio",
            type: BlockTypes.AUDIO,
            category: BlockTypeCategories.MEDIA,
            icon: (
                <Activity />
            ),
            display: "Audio",
            displayWithEmoji: "🔊Audio",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "file",
            type: BlockTypes.FILE,
            category: BlockTypeCategories.MEDIA,
            icon: (
                <File />
            ),
            display: "File",
            displayWithEmoji: "📁File",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "social",
            type: BlockTypes.SOCIAL,
            category: BlockTypeCategories.MEDIA,
            icon: (
                <Handshake />
            ),
            display: "Social",
            displayWithEmoji: "🤝Social",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "button",
            type: BlockTypes.BUTTON,
            category: BlockTypeCategories.ACTION,
            icon: (
                <SquareArrowDown />
            ),
            display: "Button",
            displayWithEmoji: "🔲Button",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "form",
            type: BlockTypes.FORM,
            category: BlockTypeCategories.ACTION,
            icon: (
                <BookText />
            ),
            display: "Form",
            displayWithEmoji: "📋Form",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "input",
            type: BlockTypes.INPUT,
            category: BlockTypeCategories.ACTION,
            icon: (
                <PenLine />
            ),
            display: "Input",
            displayWithEmoji: "📋Input",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "select",
            type: BlockTypes.SELECT,
            category: BlockTypeCategories.ACTION,
            icon: (
                <MousePointerClick />
            ),
            display: "Select",
            displayWithEmoji: "📋Select",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "checkbox",
            type: BlockTypes.CHECKBOX,
            category: BlockTypeCategories.ACTION,
            icon: (
                <Check />
            ),
            display: "Checkbox",
            displayWithEmoji: "📋Checkbox",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "radio",
            type: BlockTypes.RADIO,
            category: BlockTypeCategories.ACTION,
            icon: (
                <CircleDot />
            ),
            display: "Radio",
            displayWithEmoji: "📋Radio",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "switch",
            type: BlockTypes.SWITCH,
            category: BlockTypeCategories.ACTION,
            icon: (
                <ToggleLeft />
            ),
            display: "Switch",
            displayWithEmoji: "📋Switch",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "slider",
            type: BlockTypes.SLIDER,
            category: BlockTypeCategories.ACTION,
            icon: (
                <SlidersHorizontal />
            ),
            display: "Slider",
            displayWithEmoji: "📋Slider",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "date-picker",
            type: BlockTypes.DATE_PICKER,
            category: BlockTypeCategories.ACTION,
            icon: (
                <Calendar1 />
            ),
            display: "Date Picker",
            displayWithEmoji: "📋Date Picker",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "time-picker",
            type: BlockTypes.TIME_PICKER,
            category: BlockTypeCategories.ACTION,
            icon: (
                <Clock />
            ),
            display: "Time Picker",
            displayWithEmoji: "📋Time Picker",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "upload",
            type: BlockTypes.UPLOAD,
            category: BlockTypeCategories.ACTION,
            icon: (
                <Upload />
            ),
            display: "Upload",
            displayWithEmoji: "📋Upload",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "download",
            type: BlockTypes.DOWNLOAD,
            category: BlockTypeCategories.ACTION,
            icon: (
                <Download />
            ),
            display: "Download",
            displayWithEmoji: "📋Download",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "dropdown",
            type: BlockTypes.DROPDOWN,
            category: BlockTypeCategories.ACTION,
            icon: (
                <ChevronDown />
            ),
            display: "Dropdown",
            displayWithEmoji: "📋Dropdown",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
    
        {
            key: "spacer",
            type: BlockTypes.SPACER,
            category: BlockTypeCategories.LAYOUT,
            icon: (
                <Space />
            ),
            display: "Spacer",
            displayWithEmoji: "🔲Spacer",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 10,
                unit: "px",
                auto: false
            }
        },
        {
            key: "divider",
            type: BlockTypes.DIVIDER,
            category: BlockTypeCategories.LAYOUT,
            icon: (
                <Minus />
            ),
            display: "Divider",
            displayWithEmoji: "🔲Divider",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 10,
                unit: "px",
                auto: false
            }
        },
        {
            key: "grid",
            type: BlockTypes.GRID,
            category: BlockTypeCategories.LAYOUT,
            icon: (
                <LayoutGrid />
            ),
            display: "Grid",
            displayWithEmoji: "🔲Grid",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 10,
                unit: "px",
                auto: false
            }
        },
        {
            key: "tabs",
            type: BlockTypes.TABS,
            category: BlockTypeCategories.LAYOUT,
            icon: (
                <NotebookTabs />
            ),
            display: "Tabs",
            displayWithEmoji: "🔲Tabs",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 10,
                unit: "px",
                auto: false
            }
        },
        {
            key: "accordion",
            type: BlockTypes.ACCORDION,
            category: BlockTypeCategories.LAYOUT,
            icon: (
                <ChevronsDownUp />
            ),
            display: "Accordion",
            displayWithEmoji: "🔲Accordion",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 10,
                unit: "px",
                auto: false
            }
        },
        {
            key: "carousel",
            type: BlockTypes.CAROUSEL,
            category: BlockTypeCategories.LAYOUT,
            icon: (
                <GalleryHorizontal />
            ),
            display: "Carousel",
            displayWithEmoji: "🔲Carousel",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 10,
                unit: "px",
                auto: false
            }
        },
    
        {
            key: "chart-view",
            type: BlockTypes.CHART_VIEW,
            category: BlockTypeCategories.DATA_VIEWS,
            icon: (
                <ChartArea />
            ),
            display: "Chart View",
            displayWithEmoji: "🔲Chart View",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 10,
                unit: "px",
                auto: false
            }
        },
        {
            key: "table-view",
            type: BlockTypes.TABLE_VIEW,
            category: BlockTypeCategories.DATA_VIEWS,
            icon: (
                <Table />
            ),
            display: "Table View",
            displayWithEmoji: "🔲Table View",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 10,
                unit: "px",
                auto: false
            }
        },
        {
            key: "calendar-view",
            type: BlockTypes.CALENDAR_VIEW,
            category: BlockTypeCategories.DATA_VIEWS,
            icon: (
                <CalendarDays />
            ),
            display: "Calendar View",
            displayWithEmoji: "🔲Calendar View",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 10,
                unit: "px",
                auto: false
            }
        },
        {
            key: "kanban-view",
            type: BlockTypes.KANBAN_VIEW,
            category: BlockTypeCategories.DATA_VIEWS,
            icon: (
                <SquareKanban />
            ),
            display: "Kanban View",
            displayWithEmoji: "🔲Kanban View",
            widthInitialSizeValue: {
                value: 100,
                unit: "%",
                auto: false
            },
            heightInitialSizeValue: {
                value: 10,
                unit: "px",
                auto: false
            }
        },
        {
            key: "voting",
            type: BlockTypes.VOTING,
            category: BlockTypeCategories.COLLABORATION,
            icon: (
                <Vote />
            ),
            display: "Voting",
            displayWithEmoji: "🔲Voting",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "kanban-board",
            type: BlockTypes.KANBAN_BOARD,
            category: BlockTypeCategories.COLLABORATION,
            icon: (
                <Kanban />
            ),
            display: "Kanban Board",
            displayWithEmoji: "🔲Kanban Board",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "q-and-a",
            type: BlockTypes.Q_AND_A,
            category: BlockTypeCategories.COLLABORATION,
            icon: (
                <FileQuestion />
            ),
            display: "Q & A",
            displayWithEmoji: "🔲Q & A",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
        {
            key: "comments",
            type: BlockTypes.COMMENTS,
            category: BlockTypeCategories.COLLABORATION,
            icon: (
                <MessageCircle />
            ),
            display: "Comments",
            displayWithEmoji: "🔲Comments",
            widthInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            },
            heightInitialSizeValue: {
                value: 0,
                unit: "px",
                auto: true
            }
        },
    ];


    const categoryKeys = createMemo(() => Object.keys(BlockTypeCategories).map((key) => BlockTypeCategories[key as keyof typeof BlockTypeCategories]));

    const map = createMemo(() => {
        const map = new Map<string, BlockComponentType>();
        componentLists.forEach((item) => map.set(item.key, item));
        return map;
    });

    const categoryMap = createMemo(() => {
        const map = new Map<string, string[]>();
        componentLists.forEach((item) => {
            if (!map.has(item.category)) {
                map.set(item.category, []);
            }
            map.get(item.category)?.push(item.key);
        });
        return map;
    });

    return (
       <>
            <div
                class="fixed flex items-center justify-center bg-black bg-opacity-50 transition-opacity z-20 opacity-20 rounded-2xl"
            />
            <div 
            class="flex fixed items-center justify-center w-128 z-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            ref={props.addModalRef}
            classList={{
                "opacity-0": !props.addOpen.open,
                "scale-0": !props.addOpen.open,
                "opacity-100": props.addOpen.open,
                "scale-100": props.addOpen.open
            }}
            >
                <AddComponentModal
                    categoryKeys={categoryKeys()}
                    categoryMap={categoryMap()}
                    componentMap={map()}
                    handleAddComponent={(type: BlockComponentType) => {
                        props.addComponent(props.addOpen.id, type);
                        props.setAddOpen({ open: false, id: "" });
                    }}
                    handleClose={() => props.setAddOpen({ open: false, id: "" })}
                />
            </div>
        </>
    );
}