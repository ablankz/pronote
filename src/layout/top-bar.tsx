import { createSignal, createEffect, createMemo } from "solid-js";
import { Bold, Italic, PaintBucket, ALargeSmall } from "lucide-solid";
import TopBarMode from "../components/top-bar/mode";
import { globalCursorAction } from "../store/action";

interface TopBarProps {
    onPreviewToggle?: () => void;
    onSplitToggle?: () => void;
    class?: string;
}

export default function TopBar(props: TopBarProps) {
  const [selectedElement, setSelectedElement] = createSignal<HTMLElement | null>(null);

  createEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        const parentElement = range.startContainer.parentElement;
        setSelectedElement(parentElement);
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  });

  const applyStyle = (style: string, value: string) => {
    if (selectedElement()) {
      selectedElement()?.style.setProperty(style, value);
    }
  };

  const totalClasses = createMemo(() => {
    let classes = "w-full bg-gray-500 text-white flex px-4 py-2 items-center justify-between";
    if (props.class) classes += ` ${props.class}`;
    return classes;
  });

  return (
    <div class={totalClasses()}>
        <div class="flex items-center w-11/12">
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
        </div> 

        <div class="flex items-center relative before:absolute before:-left-4 before:bottom-0 before:top-0 before:w-[2px] before:bg-white before:content-['']">
            <TopBarMode onPreviewToggle={props.onPreviewToggle} onSplitToggle={props.onSplitToggle} />
        </div>
    </div>
  );
}
