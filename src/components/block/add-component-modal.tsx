import { X } from "lucide-solid";
import { BlockComponentType } from "./type";
import { For } from "solid-js";
import Scrollable from "../scrollable";

interface AddComponentModalProps {
    handleAddComponent: (type: BlockComponentType) => void;
    handleClose: () => void;
    categoryKeys: string[];
    categoryMap: Map<string, string[]>;
    componentMap: Map<string, BlockComponentType>;
}

export default function AddComponentModal(props: AddComponentModalProps) {
    return (
        <>
            <div class="p-4 bg-white rounded-2xl w-full shadow-lg font-black">
            <div class="w-full h-12 bg-gray-100 rounded-t-2xl flex items-center justify-center font-bold text-lg text-gray-800">
                Add Component
            </div>
            <Scrollable class="[&::-webkit-scrollbar]:w-1.5 w-full">
                <div class="mt-1 max-h-96 w-full">
                    <For each={props.categoryKeys}>
                        {
                            (category) => {
                                const itemKeys = props.categoryMap.get(category);
                                if (!itemKeys) return null;
                                return (
                                    <>
                                        <div class="text-lg font-bold text-gray-800 mt-4 ml-2">{category}</div>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gradient-to-br from-gray-100 to-gray-200 p-2 rounded-lg">
                                            <For each={itemKeys}>
                                                {
                                                    (key) => {
                                                        const component = props.componentMap.get(key);
                                                        if (!component) return null;
                                                        return (
                                                            <div 
                                                                class="p-2 bg-white border border-gray-300 rounded shadow-lg mb-1 cursor-pointer transition flex items-center justify-center flex-col hover:bg-gray-100"
                                                                onClick={() => {
                                                                    props.handleAddComponent(component);
                                                                }}
                                                            >
                                                                <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                                                    {component.icon}
                                                                </div>
                                                                <div class="p-1 cursor-pointer text-center font-bold text-gray-800">
                                                                    {component.display}
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                }
                                            </For>
                                        </div>
                                    </>
                                )
                            }
                        }
                    </For>
                </div>
            </Scrollable>
        </div>

        <div 
            class="absolute top-6 right-6 cursor-pointer bg-black-700 opacity-40 hover:opacity-50 hover:scale-105 transition-all rounded-full p-1"
        >
            <X size={26} onClick={() => props.handleClose()} class="" />
        </div>
    </>
    );
}