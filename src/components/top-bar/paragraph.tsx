import { AArrowDown, AArrowUp, Bold, Italic, Strikethrough, Underline } from "lucide-solid";
import StyleButton from "./style-button";
import { setStyle } from "../../editor/text/set-style";
import { batch, createEffect, createSignal } from "solid-js";
import { colorEqualsOptions, defaultFontColor, defaultHighlightColor, fontList, fontSizeList, lightnessRateList, minFontSize, representFontColorList, representHighlightColorList } from "../style/const";
import { currentStyle, setCurrentStyle } from "../../editor/text/store";
import { globalCursorAction } from "../../store/action";
import ColorDropdown from "../../operator/color/color-dropdown";
import { FontColorDropdownButton, HighlightColorDropdownButton } from "../../operator/color/component/dropdown-button";
import FontFamilyDropdown from "../../operator/font-family/font-family-dropdown";
import FontSizeDropdown from "../../operator/font-size/font-size-dropdown";

interface TopBarParagraphProps {
    class?: string;
    classList?: Record<string, boolean>;
}

export default function TopBarParagraph(props: TopBarParagraphProps) {
    const [localStyle, setLocalStyle] = createSignal(currentStyle().style);

    createEffect(() => {
        const newStyle = currentStyle()
        switch (newStyle.from) {
            case "topBar":
                // setLocalStyle(newStyle.style);
                // break;
            case "none":
                setLocalStyle(newStyle.style);
                break;
            default:
                setLocalStyle(newStyle.style);
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
                fontList={fontList}
                ignoreClick={globalCursorAction()}
            />
            <FontSizeDropdown
                class="bg-gray-600 rounded-r border-l border-gray-400 ml-0.5" 
                fontSize={localStyle().fontSize}
                setFontSize={setFontSize}
                onToggle={() => setStyle(() => {})}
                fontSizeList={fontSizeList}
                fontSizeRange={{
                    min: minFontSize,
                }}
                ignoreClick={globalCursorAction()}
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
                <ColorDropdown
                    class="w-full h-full" 
                    validColor={localStyle().highlightColor || ""}
                    setValidColor={(color: string) => setStyle(() => setHighlightColor(color))}
                    onToggle={() => setStyle(() => {})}
                    defaultColor={defaultHighlightColor}
                    lightnessRateList={lightnessRateList}
                    representColorList={representHighlightColorList}
                    ignoreClick={globalCursorAction()}
                    colorEqualsOptions={colorEqualsOptions}
                    title="Select a highlight color"
                    pickerDisplay={{
                        title: "Highlight Color",
                    }}
                    dropOpenButton={HighlightColorDropdownButton}
                />
            </div>

            <div class="flex items-center ml-2 bg-gray-600 rounded border border-gray-400">
                <ColorDropdown
                    class="w-full h-full" 
                    validColor={localStyle().fontColor || ""}
                    setValidColor={(color: string) => setStyle(() => setFontColor(color))}
                    onToggle={() => setStyle(() => {})}
                    defaultColor={defaultFontColor}
                    lightnessRateList={lightnessRateList}
                    representColorList={representFontColorList}
                    ignoreClick={globalCursorAction()}
                    colorEqualsOptions={colorEqualsOptions}
                    title="Select a font color"
                    pickerDisplay={{
                        title: "Font Color",
                    }}
                    dropOpenButton={FontColorDropdownButton}
                />
            </div>
        </div>    
    );
}
