import { Highlighter } from "lucide-solid";

export interface ColorDropdownButtonProps{
    isOpen: boolean,
    colorStr: string,
};

export const FontColorDropdownButton = (props: ColorDropdownButtonProps) => {
    return (
        <>
            A
            <div 
                class="absolute bottom-0.5 mx-0.5 left-0 right-0 h-1 bg-gray-500"
                style={{ "background-color": props.colorStr === "" ? "var(--color-gray-500)" : props.colorStr }}
            />
        </>
    );
};

export const HighlightColorDropdownButton = (props: ColorDropdownButtonProps) => {
    return (
        <>
            <Highlighter size={20} />
            <div 
                class="absolute bottom-0.5 mx-0.5 left-0 right-0 h-1 bg-gray-500"
                style={{ "background-color": props.colorStr === "" ? "var(--color-gray-500)" : props.colorStr }}
            />
        </>
    );
};