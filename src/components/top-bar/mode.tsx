import { createSignal, Setter } from "solid-js";
import { Eye, Pencil, SquareSplitHorizontal } from "lucide-solid";

interface TopBarModeProps {
    onPreviewToggle?: Setter<boolean>;
    onSplitToggle?: Setter<boolean>;
}

export default function TopBarMode(props: TopBarModeProps) {
  const [isPreview, setIsPreview] = createSignal(false);
  const [isSplit, setIsSplit] = createSignal(false);

  return (
        <div class="flex items-center h-[2rem]">
            <button
            class="p-2 mx-0.5 hover:bg-gray-700 rounded cursor-pointer"
            onClick={() => {
                setIsPreview(prev => !prev);
                props.onPreviewToggle && props.onPreviewToggle(prev => !prev);
            }}
            >
            {isPreview() ? <Pencil size={24} /> : <Eye size={24} />}
            </button>

            <button 
            class="p-2 mx-0.5 hover:bg-gray-700 rounded cursor-pointer" 
            classList={{ "bg-gray-700": isSplit() }}
            onClick={() => {
                setIsSplit(prev => !prev);
                props.onSplitToggle && props.onSplitToggle(prev => !prev);
            }}>
            <SquareSplitHorizontal size={24} />
            </button>
        </div>  
  );
}
