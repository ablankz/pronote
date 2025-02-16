import { AArrowDown, AArrowUp, AlignEndVertical, Bold, Italic, Strikethrough, Underline } from "lucide-solid";
import StyleButton from "./style-button";
import { 
    colorEqualsOptions, 
    defaultFontColor, 
    defaultHighlightColor, 
    fontList, 
    fontSizeList, 
    lightnessRateList, 
    minFontSize, 
    representFontColorList, 
    representHighlightColorList 
} from "../../consts/style";
import { globalCursorAction } from "../../store/action";
import ColorDropdown from "../../operator/color/color-dropdown";
import { FontColorDropdownButton, HighlightColorDropdownButton } from "../../operator/color/component/dropdown-button";
import FontFamilyDropdown from "../../operator/font-family/font-family-dropdown";
import FontSizeDropdown from "../../operator/font-size/font-size-dropdown";
import { useSetStyle } from "../../editor/text/hooks/use-set-style";
import { batch } from "solid-js";

interface TopBarParagraphProps {
    class?: string;
    classList?: Record<string, boolean>;
}

export default function TopBarParagraph(props: TopBarParagraphProps) {
    const {
        localStyle,
        updateFontSize,
        setFontFamily,
        setFontSize,
        nearTrueBold,
        nearTrueItalic,
        nearTrueUnderline,
        nearTrueStrikeThrough,
        setHighlightColor,
        setFontColor,
        setVerticalAlign,
        setFontScale,
    } = useSetStyle("topBar");

    const fontSizeValidator = (size: number) => (size <= minFontSize) ? minFontSize : size;

    return (
        <div 
            class={`flex items-center p-2 rounded ${props.class}`}
            classList={{
            ...(props.classList || {}),
            }}
            on:mousedown={(e: MouseEvent) => e.preventDefault()}
        >
            <FontFamilyDropdown
                class="bg-gray-600 rounded-l" 
                fontFamily={localStyle().fontFamily}
                setFontFamily={setFontFamily}
                fontList={fontList}
                ignoreClick={globalCursorAction()}
            />
            <FontSizeDropdown
                class="bg-gray-600 rounded-r border-l border-gray-400 ml-0.5" 
                fontSize={localStyle().fontSize}
                setFontSize={setFontSize}
                fontSizeList={fontSizeList}
                fontSizeRange={{
                    min: minFontSize,
                }}
                ignoreClick={globalCursorAction()}
            />

            <div class="flex items-center ml-2 bg-gray-600 rounded border border-gray-400 p-0.5">
                <StyleButton 
                    Icon={<AArrowUp size={24} />} 
                    onClick={(_) => updateFontSize(1, fontSizeValidator)}
                    class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                    classList={{
                        "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                    }}
                />

                <StyleButton 
                    Icon={<AArrowDown size={18} />}
                    onClick={(_) => updateFontSize(-1, fontSizeValidator)}
                    class="mx-1 rounded w-7 h-7 flex items-end justify-center pb-1"
                    classList={{
                        "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                    }}
                />

                <StyleButton 
                    Icon={<Bold size={20} />} 
                    onClick={nearTrueBold}
                    class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                    classList={{
                        "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                        "bg-gray-500 border border-gray-400": localStyle().bold || false,
                    }}
                />

                <StyleButton 
                    Icon={<Italic size={20} />} 
                    onClick={nearTrueItalic}
                    class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                    classList={{
                        "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                        "bg-gray-500 border border-gray-400": localStyle().italic || false,
                    }}
                />

                <StyleButton 
                    Icon={<Underline size={20} />}
                    onClick={nearTrueUnderline}
                    class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                    classList={{
                        "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                        "bg-gray-500 border border-gray-400": localStyle().underline || false,
                    }}
                />

                <StyleButton
                    Icon={<Strikethrough size={20} />}
                    onClick={nearTrueStrikeThrough}
                    class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                    classList={{
                        "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                        "bg-gray-500 border border-gray-400": localStyle().strikeThrough || false,
                    }}
                />

                {/* <StyleButton
                    Icon={<AlignEndVertical size={20} />}
                    onClick={() => {
                        batch(() => {
                            setVerticalAlign("sub");
                            setFontScale(0.75);
                        });  
                    }}
                    class="mx-1 rounded w-7 h-7 flex items-center justify-center"
                    classList={{
                        "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
                        "bg-gray-500 border border-gray-400": localStyle().strikeThrough || false,
                    }}
                /> */}
            </div>

            <div class="flex items-center ml-2 bg-gray-600 rounded border border-gray-400">
                <ColorDropdown
                    class="w-full h-full" 
                    validColor={localStyle().highlightColor || ""}
                    setValidColor={setHighlightColor}
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
                    setValidColor={setFontColor}
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
