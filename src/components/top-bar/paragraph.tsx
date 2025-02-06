import { AArrowDown, AArrowUp, Bold, Italic, Strikethrough, Underline } from "lucide-solid";
import { currentStyle, globalCursorAction, setCurrentStyle } from "../../store/action";
import FontFamilyDropdown from "./font-family-dropdown";
import FontSizeDropdown from "./font-size-dropdown";
import { createEffect } from "solid-js";
import StyleButton from "./style-button";
import { minFontSize } from "../../consts/font";

interface TopBarParagraphProps {
    class?: string;
    classList?: Record<string, boolean>;
}

export default function TopBarParagraph(props: TopBarParagraphProps) {

    const setFontFamily = (fontFamily: string) => {
        setCurrentStyle(prev => {
            return {
                ...prev,
                fontFamily: fontFamily,
            };
        });
    }

    const setFontSize = (fontSize: number) => {
        setCurrentStyle(prev => {
            return {
                ...prev,
                fontSize: fontSize,
            };
        });
    }

    const changeFontSizes = (size: number) => {
        setCurrentStyle(prev => {
            const newSize = prev.fontSize + size;
            return {
                ...prev,
                fontSize: newSize <= minFontSize ? minFontSize : newSize,
            };
        });
    }

    const setSwitchBold = () => {
        setCurrentStyle(prev => {
            return {
                ...prev,
                bold: !prev.bold,
            };
        });
    }

    const setSwitchItalic = () => {
        setCurrentStyle(prev => {
            return {
                ...prev,
                italic: !prev.italic
            };
        });
    }

    const setSwitchUnderline = () => {
        setCurrentStyle(prev => {
            return {
                ...prev,
                underline: !prev.underline,
            };
        });
    }

    const setSwitchStrikeThrough = () => {
        setCurrentStyle(prev => {
            return {
                ...prev,
                strikeThrough: !prev.strikeThrough,
            };
        });
    }

    createEffect(() => {
        console.log(currentStyle());
    });

  return (
    <div 
        class={`flex items-center p-2 rounded ${props.class}`}
        classList={{
        ...(props.classList || {}),
        }}
    >
        <FontFamilyDropdown 
            class="bg-gray-600 rounded-l" 
            fontFamily={currentStyle().fontFamily}
            setFontFamily={setFontFamily}
        />
        <FontSizeDropdown 
            class="bg-gray-600 rounded-r border-l border-gray-400 ml-0.5" 
            fontSize={currentStyle().fontSize}
            setFontSize={setFontSize}
        />

        <div class="flex items-center ml-2 bg-gray-600 rounded border border-gray-400 p-0.5">
            <StyleButton 
                Icon={<AArrowUp size={24} />} 
                onClick={() => changeFontSizes(1)}
                class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                classList={{
                    "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                }}
            />

            <StyleButton 
                Icon={<AArrowDown size={18} />}
                onClick={() => changeFontSizes(-1)}
                class="mx-1 rounded w-7 h-7 flex items-end justify-center pb-1"
                classList={{
                    "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                }}
            />

            <StyleButton 
                Icon={<Bold size={20} />} 
                onClick={setSwitchBold}
                class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                classList={{
                    "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                    "bg-gray-500 border border-gray-400": currentStyle().bold,
                }}
            />

            <StyleButton 
                Icon={<Italic size={20} />} 
                onClick={setSwitchItalic}
                class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                classList={{
                    "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                    "bg-gray-500 border border-gray-400": currentStyle().italic,
                }}
            />

            <StyleButton 
                Icon={<Underline size={20} />}
                onClick={setSwitchUnderline}
                class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                classList={{
                    "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                    "bg-gray-500 border border-gray-400": currentStyle().underline,
                }}
            />

            <StyleButton
                Icon={<Strikethrough size={20} />}
                onClick={setSwitchStrikeThrough}
                class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                classList={{
                    "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                    "bg-gray-500 border border-gray-400": currentStyle().strikeThrough,
                }}
            />

        </div>
    </div>    
  );
}
