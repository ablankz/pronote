import { createMemo } from "solid-js";
import TopBarMode from "../components/top-bar/mode";
import TopBarParagraph from "../components/top-bar/paragraph";

interface TopBarProps {
    onPreviewToggle?: () => void;
    onSplitToggle?: () => void;
    class?: string;
}

export default function TopBar(props: TopBarProps) {
  const totalClasses = createMemo(() => {
    let classes = "w-full bg-gray-500 text-white flex px-4 py-2 items-center justify-between";
    if (props.class) classes += ` ${props.class}`;
    return classes;
  });

  return (
    <div class={totalClasses()}>
        <div class="flex items-center">
          <TopBarParagraph />
        </div> 

        <div class="flex items-center relative before:absolute before:-left-4 before:bottom-0 before:top-0 before:w-[2px] before:bg-white before:content-['']">
            <TopBarMode onPreviewToggle={props.onPreviewToggle} onSplitToggle={props.onSplitToggle} />
        </div>
    </div>
  );
}
