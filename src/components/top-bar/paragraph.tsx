import { ALargeSmall, Bold, Italic, PaintBucket } from "lucide-solid";
import { globalCursorAction } from "../../store/action";

interface TopBarParagraphProps {
}

export default function TopBarParagraph(props: TopBarParagraphProps) {
    const applyStyle = (style: string, value: string) => {
        // if (selectedElement()) {
        //     selectedElement()?.style.setProperty(style, value);
        // }
    };

  return (
    <div class="flex items-center bg-amber-50 text-amber-900 p-2 rounded w-full">
        <div class="p-1 mx-1 rounded" onClick={() => applyStyle("font-weight", "bold")}
        classList={{
            "cursor-pointer hover:bg-amber-100": !globalCursorAction(),
        }}>
            <Bold size={20} />
        </div>
        <div class="p-1 mx-1 rounded" onClick={() => applyStyle("font-style", "italic")}
        classList={{
            "cursor-pointer hover:bg-amber-100": !globalCursorAction(),
        }}>
            <Italic size={20} />
        </div>
        <div class="p-1 mx-1 rounded" onClick={() => applyStyle("font-size", "20px")}
        classList={{
            "cursor-pointer hover:bg-amber-100": !globalCursorAction(),
        }}>
            <ALargeSmall size={20} />
        </div>
        <div class="p-1 mx-1 rounded" onClick={() => applyStyle("background-color", "yellow")}
        classList={{
            "cursor-pointer hover:bg-amber-100": !globalCursorAction(),
        }}>
            <PaintBucket size={20} />
        </div>
    </div>    
  );
}
