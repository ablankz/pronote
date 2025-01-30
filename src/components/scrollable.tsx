import { createMemo, JSX } from "solid-js";


interface ScrollableProps {
    children: JSX.Element;
    class?: string;
    classList?: Record<string, boolean>;
}

export default function Scrollable(props: ScrollableProps) {

    const totalClasses = createMemo(() => {
        let classes = "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 overflow-y-auto h-full";
        if (props.class) classes += ` ${props.class}`;
        return classes;
    });

    return (
        <div class={totalClasses()} classList={props.classList}>
            {props.children}
        </div>
    );
}