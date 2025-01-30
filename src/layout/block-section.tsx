import { Portal, Show } from "solid-js/web";
import Scrollable from "../components/scrollable";
import { createMemo, createSignal, createUniqueId, onCleanup, onMount } from "solid-js";
import { AddOpenState, ResizeBlockProps } from "../components/block/type";
import BlockComponent from "../components/block/component";

export default function BlockSection() {
    const [addOpen, setAddOpen] = createSignal<AddOpenState>({
        open: false,
        id: ""
    });
    const [selected, setSelected] = createSignal<string>("");
    const [resizeState, setResizeState] = createSignal<ResizeBlockProps>({
        resizing: false,
        resizerId: "",
        direction: "right"
    });
    let addModalRef: HTMLDivElement | undefined;
    let sectionRef: HTMLDivElement | undefined;
    
    const handleClickOutside = (event: MouseEvent) => {
        if (addModalRef && !addModalRef.contains(event.target as Node)) {
            setAddOpen({ open: false, id: "" });
        }

        if (sectionRef && sectionRef.contains(event.target as Node)) {
            const component = document.getElementsByClassName("block-component");
            let contains = false;
            for (let i = 0; i < component.length; i++) {
                if (component[i].contains(event.target as Node)) {
                    contains = true;
                    break;
                }
            }
            if (!contains) {
                setSelected("");
            }
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setAddOpen({ open: false, id: "" });
            setSelected("");
        }
    };

    onMount(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
    });

    onCleanup(() => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
    });

    const id = createMemo(() => createUniqueId());

    return (
        <Scrollable class="[&::-webkit-scrollbar]:w-3 w-full">
            <div 
                class="py-6 px-12 flex flex-col items-center space-y-4 shadow rounded mb-2 bg-gray-50 max-w-[calc(100%-2rem)]"
                ref={sectionRef}
            >
                <BlockComponent 
                    id={id()} 
                    isResizing={resizeState()} 
                    setIsResizing={setResizeState} 
                    handleAddBlock={(id) => setAddOpen({ open: true, id })} 
                    addOpen={addOpen().open && addOpen().id === id()} 
                    setSelected={setSelected}
                    isSelected={selected() === id()}
                />
            </div>
            <Portal>
                <Show when={addOpen().open}>
                <div
                    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity z-20 opacity-20"
                />
                    <div
                    style={`
                        position: absolute;
                        inset: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    `}
                    ref={addModalRef}
                    >
                    <div
                        style={`
                        padding: 2rem;
                        background-color: #eee;
                        color: black;
                        `}
                    >
                        Hello from modal <br />
                        <button onClick={() => setAddOpen({ open: false, id: "" })}
                            >close modal</button>
                    </div>
                    </div>
                </Show>
            </Portal>
        </Scrollable>
    );
}