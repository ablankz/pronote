import { createSignal, createEffect, createMemo } from "solid-js";
import TopBarMode from "../components/top-bar/mode";
import TopBarParagraph from "../components/top-bar/paragraph";

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

  const totalClasses = createMemo(() => {
    let classes = "w-full bg-gray-500 text-white flex px-4 py-2 items-center justify-between";
    if (props.class) classes += ` ${props.class}`;
    return classes;
  });

  return (
    <div class={totalClasses()}>
        <div class="flex items-center w-11/12">
          <TopBarParagraph />
        </div> 

        <div class="flex items-center relative before:absolute before:-left-4 before:bottom-0 before:top-0 before:w-[2px] before:bg-white before:content-['']">
            <TopBarMode onPreviewToggle={props.onPreviewToggle} onSplitToggle={props.onSplitToggle} />
        </div>
    </div>
  );
}
