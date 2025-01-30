import { createSignal, createEffect, createMemo } from "solid-js";
import { Bold, Italic, PaintBucket, ALargeSmall } from "lucide-solid";
import TopBarMode from "../components/top-bar/mode";

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
              <button class="p-1 mx-1 hover:bg-amber-100 rounded cursor-pointer" onClick={() => applyStyle("font-weight", "bold")}>
                  <Bold size={20} />
              </button>
              <button class="p-1 mx-1 hover:bg-amber-100 rounded cursor-pointer" onClick={() => applyStyle("font-style", "italic")}>
                  <Italic size={20} />
              </button>
              <button class="p-1 mx-1 hover:bg-amber-100 rounded cursor-pointer" onClick={() => applyStyle("font-size", "20px")}>
                  <ALargeSmall size={20} />
              </button>
              <button class="p-1 mx-1 hover:bg-amber-100 rounded cursor-pointer" onClick={() => applyStyle("background-color", "yellow")}>
                  <PaintBucket size={20} />
              </button>
          </div>    
        </div> 

        <div class="flex items-center relative before:absolute before:-left-4 before:bottom-0 before:top-0 before:w-[2px] before:bg-white before:content-['']">
            <TopBarMode onPreviewToggle={props.onPreviewToggle} onSplitToggle={props.onSplitToggle} />
        </div>
    </div>
  );
}
