import { createSignal, Setter } from "solid-js";
import { Eye, Pencil, SquareSplitHorizontal } from "lucide-solid";
import { globalCursorAction } from "../../store/action";

interface TopBarModeProps {
    onPreviewToggle?: Setter<boolean>;
    onSplitToggle?: Setter<boolean>;
}

export default function TopBarMode(props: TopBarModeProps) {
  const [isPreview, setIsPreview] = createSignal(false);
  const [isSplit, setIsSplit] = createSignal(false);

  return (
        <div class="flex items-center h-[2rem]">
            <div
            class="p-2 mx-0.5 rounded"
            classList={{
                "cursor-pointer hover:bg-gray-700": !globalCursorAction(),
            }}
            onClick={() => {
                if (globalCursorAction()) return;
                setIsPreview(prev => !prev);
                props.onPreviewToggle && props.onPreviewToggle(prev => !prev);
            }}
            >
            {isPreview() ? <Pencil size={24} /> : <Eye size={24} />}
            </div>

            <div 
            class="p-2 mx-0.5 rounded"
            classList={{
                "cursor-pointer hover:bg-gray-700": !globalCursorAction(),
                "bg-gray-700": isSplit(),
            }} 
            onClick={() => {
                if (globalCursorAction()) return;
                setIsSplit(prev => !prev);
                props.onSplitToggle && props.onSplitToggle(prev => !prev);
            }}>
            <SquareSplitHorizontal size={24} />
            </div>
        </div>  
  );
}
