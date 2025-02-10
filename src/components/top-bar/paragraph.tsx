import { AArrowDown, AArrowUp, Bold, Italic, Strikethrough, Underline } from "lucide-solid";
import { currentStyle, globalCursorAction, setCurrentStyle } from "../../store/action";
import FontFamilyDropdown from "./font-family-dropdown";
import FontSizeDropdown from "./font-size-dropdown";
import StyleButton from "./style-button";
import { minFontSize } from "../../consts/font";
import FontColorDropdown from "./font-color-dropdown";
import HighlightColorDropdown from "./highlight-color-dropdown";
import { setStyle } from "../../utils/set-style";
import { batch, createEffect, createSignal } from "solid-js";

interface TopBarParagraphProps {
    class?: string;
    classList?: Record<string, boolean>;
}

export default function TopBarParagraph(props: TopBarParagraphProps) {
    const [localStyle, setLocalStyle] = createSignal(currentStyle().style);

    createEffect(() => {
        const newStyle = currentStyle()
        switch (newStyle.from) {
            case "textArea":
                setLocalStyle(newStyle.style);
                break;
            case "none":
                setLocalStyle(newStyle.style);
                break;
            default:
                break;
        }
    });

    const setFontFamily = (fontFamily: string) => {
        batch(() => {
            setCurrentStyle(prev => {
                return {
                    style: {
                        ...prev.style,
                        fontFamily: fontFamily,
                    },
                    selectType: "cursor",
                    from: "topBar",
                }
            });
            setLocalStyle(prev => {
                return {
                    ...prev,
                    fontFamily: fontFamily,
                };
            });
        });
    }

    const setFontSize = (fontSize: number) => {
        batch(() => {
            setCurrentStyle(prev => {
                return {
                    style: {
                        ...prev.style,
                        fontSize: fontSize,
                    },
                    selectType: "cursor",
                    from: "topBar",
                }
            });
            setLocalStyle(prev => {
                return {
                    ...prev,
                    fontSize: fontSize,
                };
            });
        });
    }

    const changeFontSizes = (size: number) => {
        batch(() => {
            setCurrentStyle(prev => {
                if (prev.style.fontSize === undefined) return prev;
                const newSize = prev.style.fontSize + size;
                return {
                    style: {
                        ...prev.style,
                        fontSize: newSize <= minFontSize ? minFontSize : newSize,
                    },
                    selectType: "cursor",
                    from: "topBar",
                };
            });
            setLocalStyle(prev => {
                if (prev.fontSize === undefined) return prev;
                const newSize = prev.fontSize + size;
                return {
                    ...prev,
                    fontSize: newSize <= minFontSize ? minFontSize : newSize,
                };
            });
        });
    }

    const setSwitchBold = () => {
        batch(() => {
            setCurrentStyle(prev => {
                if (prev.style.bold === undefined) return prev;
                return {
                    style: {
                        ...prev.style,
                        bold: !prev.style.bold,
                    },
                    selectType: "cursor",
                    from: "topBar",
                };
            });
            setLocalStyle(prev => {
                return {
                    ...prev,
                    bold: !prev.bold,
                };
            });
        });
    }

    const setSwitchItalic = () => {
        batch(() => {
            setCurrentStyle(prev => {
                if (prev.style.italic === undefined) return prev;
                return {
                    style: {
                        ...prev.style,
                        italic: !prev.style.italic,
                    },
                    selectType: "cursor",
                    from: "topBar",
                };
            });
            setLocalStyle(prev => {
                return {
                    ...prev,
                    italic: !prev.italic,
                };
            });
        });
    }

    const setSwitchUnderline = () => {
        batch(() => {
            setCurrentStyle(prev => {
                if (prev.style.underline === undefined) return prev;
                return {
                    style: {
                        ...prev.style,
                        underline: !prev.style.underline,
                    },
                    selectType: "cursor",
                    from: "topBar",
                };
            });
            setLocalStyle(prev => {
                return {
                    ...prev,
                    underline: !prev.underline,
                };
            });
        });
    }

    const setSwitchStrikeThrough = () => {
        batch(() => {
            setCurrentStyle(prev => {
                if (prev.style.strikeThrough === undefined) return prev;
                return {
                    style: {
                        ...prev.style,
                        strikeThrough: !prev.style.strikeThrough,
                    },
                    selectType: "cursor",
                    from: "topBar",
                };
            });
            setLocalStyle(prev => {
                return {
                    ...prev,
                    strikeThrough: !prev.strikeThrough,
                };
            });
        });
    }

    const setFontColor = (color: string) => {
        batch(() => {
            setCurrentStyle(prev => {
                if (prev.style.fontColor === undefined) return prev;
                return {
                    style: {
                        ...prev.style,
                        fontColor: color,
                    },
                    selectType: "cursor",
                    from: "topBar",
                };
            });
            setLocalStyle(prev => {
                return {
                    ...prev,
                    fontColor: color,
                };
            });
        });
    }

    const setHighlightColor = (color: string) => {
        batch(() => {
            setCurrentStyle(prev => {
                if (prev.style.highlightColor === undefined) return prev;
                return {
                    style: {
                        ...prev.style,
                        highlightColor: color,
                    },
                    selectType: "cursor",
                    from: "topBar",
                };
            });
            setLocalStyle(prev => {
                return {
                    ...prev,
                    highlightColor: color,
                };
            });
        });
    }

    return (
        <div 
            class={`flex items-center p-2 rounded ${props.class}`}
            classList={{
            ...(props.classList || {}),
            }}
        >
            <FontFamilyDropdown 
                class="bg-gray-600 rounded-l" 
                fontFamily={localStyle().fontFamily}
                setFontFamily={setFontFamily}
                onToggle={() => setStyle(() => {})}
            />
            <FontSizeDropdown 
                class="bg-gray-600 rounded-r border-l border-gray-400 ml-0.5" 
                fontSize={localStyle().fontSize}
                setFontSize={setFontSize}
                onToggle={() => setStyle(() => {})}
            />

            <div class="flex items-center ml-2 bg-gray-600 rounded border border-gray-400 p-0.5">
                <StyleButton 
                    Icon={<AArrowUp size={24} />} 
                    onClick={(_) => setStyle(() => changeFontSizes(1))}
                    class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                    classList={{
                        "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                    }}
                />

                <StyleButton 
                    Icon={<AArrowDown size={18} />}
                    onClick={(_) => setStyle(() => changeFontSizes(-1))}
                    class="mx-1 rounded w-7 h-7 flex items-end justify-center pb-1"
                    classList={{
                        "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                    }}
                />

                <StyleButton 
                    Icon={<Bold size={20} />} 
                    onClick={(_) => setStyle(setSwitchBold)}
                    class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                    classList={{
                        "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                        "bg-gray-500 border border-gray-400": localStyle().bold || false,
                    }}
                />

                <StyleButton 
                    Icon={<Italic size={20} />} 
                    onClick={(_) => setStyle(setSwitchItalic)}
                    class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                    classList={{
                        "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                        "bg-gray-500 border border-gray-400": localStyle().italic || false,
                    }}
                />

                <StyleButton 
                    Icon={<Underline size={20} />}
                    onClick={(_) => setStyle(setSwitchUnderline)}
                    class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                    classList={{
                        "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                        "bg-gray-500 border border-gray-400": localStyle().underline || false,
                    }}
                />

                <StyleButton
                    Icon={<Strikethrough size={20} />}
                    onClick={(_) => setStyle(setSwitchStrikeThrough)}
                    class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                    classList={{
                        "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                        "bg-gray-500 border border-gray-400": localStyle().strikeThrough || false,
                    }}
                />
            </div>

            <div class="flex items-center ml-2 bg-gray-600 rounded border border-gray-400">
                <HighlightColorDropdown
                        class="w-full h-full" 
                        highlightColor={localStyle().highlightColor || ""}
                        setHighlightColor={(color: string) => setStyle(() => setHighlightColor(color))}
                        onToggle={() => setStyle(() => {})}
                    />
            </div>

            <div class="flex items-center ml-2 bg-gray-600 rounded border border-gray-400">
                <FontColorDropdown
                    class="w-full h-full" 
                    fontColor={localStyle().fontColor || ""}
                    setFontColor={(color: string) => setStyle(() => setFontColor(color))}
                    onToggle={() => setStyle(() => {})}
                />
            </div>
        </div>    
    );
}
