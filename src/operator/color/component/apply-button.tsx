import { HSLColor, RGBColor } from "../utils";

export interface ColorPickerApplyButtonProps{
    colorHSL: HSLColor | null,
    colorRGB: RGBColor | null,
    colorHex: string | null,
    colorStr: string | null,
    ignoreClick?: boolean, 
    setColor: (color: string) => void,
    handleClose: () => void 
};

export const DefaultColorPickerApplyButton = (props: ColorPickerApplyButtonProps) => {
    return (
        <div 
            class="text-white rounded px-2 py-1 border border-gray-300 bg-blue-500 flex items-center justify-center"
            classList={{
                "cursor-pointer hover:bg-blue-600": !props.ignoreClick,
            }}
            onClick={() => {
                if (props.ignoreClick) return;

                props.setColor(props.colorStr || "");
                props.handleClose();
            }}
        >
            Apply
        </div>
    );
};