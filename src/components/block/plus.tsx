import { Plus } from "lucide-solid";
import { Show } from "solid-js";
import { globalCursorAction } from "../../store/action";

interface BlockComponentProps {
    id: string;
    handleAddBlock: (id: string) => void;
    addOpen: boolean;
}

export default function BlockPlus(props: BlockComponentProps) {
    return (
        <>
            <div 
                class="relative w-5/6 h-[3rem] opacity-80 rounded-2xl mt-8 mb-6"
                classList={{
                    "cursor-pointer hover:bg-gray-200 hover:opacity-100": !globalCursorAction(),
                }}
                on:click={() => {
                    if (globalCursorAction()) return;
                    props.handleAddBlock(props.id);
                }} 
            >
                <div class="absolute top-5 w-full flex justify-center items-center">
                    <div class="w-11/12 border-dashed border-2 border-gray-300" />
                </div>
                <div 
                class="absolute top-2.5 left-1/2 transform -translate-x-1/2 flex items-center" 
                >
                    <div class="bg-blue-600 text-white p-1 rounded-full shadow-lg"
                    classList={{
                        "cursor-pointer": !globalCursorAction(),
                    }}>
                        <Plus size={20} />
                    </div>
                </div>
            </div>
            <Show when={props.addOpen}>
                <div 
                    class="w-4/5 h-[196px] bottom-0 left-0 border-dashed border-2 border-gray-400 opacity-20 rounded-md mb-6"
                />
            </Show>
        </>
    );
}