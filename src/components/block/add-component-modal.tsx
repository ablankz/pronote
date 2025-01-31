import { SquareX } from "lucide-solid";
import { BlockComponentType } from "./type";
import { For } from "solid-js";
import { componentLists } from "./const";
import Scrollable from "../scrollable";

interface AddComponentModalProps {
    handleAddComponent: (type: BlockComponentType) => void;
    handleClose: () => void;
}

export default function AddComponentModal(props: AddComponentModalProps) {
    return (
        <>
            <div class="p-4 bg-white rounded-2xl w-full shadow-lg font-black">
            <div class="w-full h-12 bg-gray-200 rounded-t-2xl flex items-center justify-center font-bold text-lg text-gray-800">
                Add Component
            </div>
            <Scrollable class="[&::-webkit-scrollbar]:w-1.5 w-full">
                <div class="mt-1 max-h-72 w-full">

                    <For each={componentLists}>
                        {(component) => (
                            <div class="w-full bg-white border border-gray-300 rounded shadow-lg mb-1">
                                <div
                                    class="p-2 cursor-pointer transition hover:bg-gray-100 text-center"
                                    onClick={() => {
                                        props.handleAddComponent(component);
                                    }}
                                    >
                                    {component.displayWithEmoji || component.display}
                                </div>
                            </div>
                        )}
                    </For>
                </div>
            </Scrollable>
        </div>

        <div class="absolute top-6 right-6 rounded-full cursor-pointer">
            <SquareX size={28} onClick={() => props.handleClose()} />
        </div>
    </>
    );
}