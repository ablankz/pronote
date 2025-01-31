import { Show } from "solid-js/web";
import Scrollable from "../components/scrollable";
import { createMemo, createSignal, createUniqueId, For, onCleanup, onMount } from "solid-js";
import { AddOpenState, BlockComponentType, BlockTypes, ComponentBlock, ResizeBlockProps } from "../components/block/type";
import BlockComponent from "../components/block/component";
import DragAndDrop from "../components/drag-and-drop";
import BlockPlus from "../components/block/plus";
import AddComponentModal from "../components/block/add-component-modal";

interface internalBlock {
    internalId: string;
    component?: ComponentBlock;
}

export default function BlockSection() {
    const [rootBlocks, setRootBlocks] = createSignal<internalBlock[]>([]);

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
    const [deleting, setDeleting] = createSignal<string | null>(null);

    const handleDeleteBlock = (id: string) => {
        setDeleting(id); // 削除対象を設定
        setTimeout(() => {
            setRootBlocks(rootBlocks().filter((el) => el.component?.id !== id));
            setSelected("");
            setDeleting(null);
        }, 300);
    };
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

    const addComponent = (componentType: BlockComponentType) => {
        const componentBlock: ComponentBlock = {
            id: createUniqueId(),
            type: componentType.type,
            data: {},
            widthInitialSizeValue: componentType.widthInitialSizeValue,
            heightInitialSizeValue: componentType.heightInitialSizeValue
        };
        switch (componentType.type) {
            case BlockTypes.TEXT:
                componentBlock.data = {
                    text: "Hello, World!"
                };
            }

        setRootBlocks([...rootBlocks(), {
            internalId: createUniqueId(),
            component: componentBlock
        }]);
    }

    const keys = createMemo(() => rootBlocks().map((el) => el.internalId));

    const map = createMemo(() => {
        const map = new Map<string, internalBlock>();
        rootBlocks().forEach((item) => map.set(item.internalId, item));
        return map;
    });

    onMount(() => {
        setRootBlocks([{ 
            internalId: createUniqueId(),
        }]);

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
    });

    onCleanup(() => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
    });

    return (
        <Scrollable class="[&::-webkit-scrollbar]:w-3 w-full relative">
                <div 
                    class="py-6 px-12 flex flex-col items-center space-y-4 shadow rounded mb-2 bg-gray-50 w-full max-w-[calc(100%-2rem)] pb-24"
                    ref={sectionRef}
                >
                    <For each={keys()}>
                        {(key) => {
                            const item = map().get(key);
                            return (
                                <div 
                                    class="transition-opacity duration-300 w-full h-full flex flex-col items-center justify-center"
                                    classList={{
                                        "opacity-0": deleting() === item?.component?.id,
                                        "opacity-100": deleting() !== item?.component?.id,
                                        "pointer-events-none": deleting() === item?.component?.id
                                    }}
                                >
                                    <Show when={item?.component}>
                                        <BlockComponent 
                                            component={item?.component!}
                                            isResizing={resizeState()} 
                                            setIsResizing={setResizeState} 
                                            handleAddBlock={(id) => setAddOpen({ open: true, id })} 
                                            addOpen={addOpen().open && addOpen().id === item?.component?.id!}
                                            setSelected={setSelected}
                                            isSelected={selected() === item?.component?.id!}
                                            isRootBlock={true}
                                            handleDeleteBlock={(id) => {
                                                handleDeleteBlock(id);
                                            }}
                                        />
                                    </Show>
                                    
                                    <BlockPlus
                                        id={`plus-${key}`}
                                        handleAddBlock={(id: string) => setAddOpen({ open: true, id: id })}
                                        addOpen={addOpen().open && addOpen().id === `plus-${key}`}
                                    />
                                </div>
                            );
                        }}
                    </For>

                    {/* <DragAndDrop /> */}
                </div>
                    <Show when={addOpen().open}>
                        <div
                            class="fixed flex items-center justify-center bg-black bg-opacity-50 transition-opacity z-20 opacity-20 rounded-2xl"
                        />
                        <div class="absolute flex items-center justify-center w-96 z-30 top-2/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2" ref={addModalRef}>
                            <AddComponentModal
                                handleAddComponent={(type) => {
                                    addComponent(type);
                                    setAddOpen({ open: false, id: "" });
                                }}
                                handleClose={() => setAddOpen({ open: false, id: "" })}
                            />
                        </div>
                    </Show>
        </Scrollable>
    );
}