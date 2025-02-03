import { createEffect, createMemo } from "solid-js";
import { Grip, EllipsisVertical, Search } from "lucide-solid";
import ProfileAvatar from "../components/avatar";
import { globalCursorAction } from "../store/action";

interface HeaderProps {
    class?: string;
}

export default function Header(props: HeaderProps) {
    const totalClasses = createMemo(() => {
        let classes = "bg-gray-700 text-white py-2 px-6 w-full flex items-center justify-between";
        if (props.class) classes += ` ${props.class}`;
        return classes;
    });

    let inputRef: HTMLInputElement | null = null as HTMLInputElement | null;

    createEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (globalCursorAction()) return;
            
            if (e.ctrlKey && e.key === "k") {
                e.preventDefault();
                inputRef?.focus();
            }

            if (e.key === "Escape") {
                inputRef?.blur();
            }
        };
    
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    });

  return (
    <div class={totalClasses()}>
        <div class="flex items-center"
        classList={{
            "cursor-pointer": !globalCursorAction(),
        }}
        >
            <Grip size={24} />
        </div> 

        <div class="relative w-96">
            <input
                ref={inputRef!}
                type="text" 
                class="bg-gray-600 text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 transition-all duration-300 w-full"
                placeholder="Search... (Ctrl + K)"
            />
            <Search size={24} class="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer" />
        </div>

        <div class="flex items-center space-x-4">
            <EllipsisVertical size={24} class="rounded"
            classList={{
                "cursor-pointer hover:bg-gray-600": !globalCursorAction(),
            }} />
            <ProfileAvatar name="John Doe" size="32px" />
        </div>
    </div>
  );
}
