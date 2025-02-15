import { Show } from "solid-js/web";
import Scrollable from "../components/scrollable";
import { batch, createEffect, createMemo, createSignal, For, onCleanup, onMount } from "solid-js";
import BlockComponent from "../components/block/component";
import BlockPlus from "../components/block/plus";
import ComponentAdder from "../components/block/component-adder";
import { globalCursorAction, setDetailOpen } from "../store/action";
import { BlockComponentType, BlockTypes, ComponentBlock } from "../types/block";
import { AddOpenState } from "../types/state";
import { selectedBlock, setSelectedBlock } from "../store/select";
import { TextValidComponentsMap } from "../editor/text/id";
import { 
    setCurrentStyle, 
    setEditableTextRef, 
    textRefMap 
} from "../editor/text/store";
import { DefaultFlexibleTextStyles } from "../renderer/text/const";
import { generateUniqueID } from "../utils/generate";

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
    const [deleting, setDeleting] = createSignal<string | null>(null);

    const handleDeleteBlock = (id: string) => {
        setDeleting(id); // 削除対象を設定
        setTimeout(() => {
            setRootBlocks(rootBlocks().filter((el) => el.component?.id !== id));
            setSelectedBlock(null);
            setDeleting(null);
        }, 300);
    };
    let addModalRef: HTMLDivElement | undefined;
    let sectionRef: HTMLDivElement | undefined;


    createEffect(() => {
        const selected = selectedBlock();
        if (!selected) {
            batch(() => {
                setEditableTextRef(null);
                setCurrentStyle({
                    style: DefaultFlexibleTextStyles,
                    selectType: "cursor",
                    from: "none"
                });
            });
            return;
        }
        const selectedId = selected.component.id;
        const componentType = selected.component.type;
        const prefix = TextValidComponentsMap[componentType];
        const selectedRef = textRefMap().get(prefix + selectedId);
        if (!selectedRef) {
            batch(() => {
                setEditableTextRef(null);
                setCurrentStyle({
                    style: DefaultFlexibleTextStyles,
                    selectType: "cursor",
                    from: "none"
                });
            });
            return;
        }
        batch(() => {
            setCurrentStyle({
                style: DefaultFlexibleTextStyles,
                selectType: "cursor",
                from: "none"
            });
            setEditableTextRef({
                elm: selectedRef, 
                id: prefix + selectedId,
                newSelected: true 
            });
        });
    });
    
    const handleClickOutside = (event: MouseEvent) => {
        if (globalCursorAction()) return;

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
                setSelectedBlock(null);
                setDetailOpen(false);
            }
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            if (globalCursorAction()) return;

            setAddOpen({ open: false, id: "" });
            setSelectedBlock(null);
            setDetailOpen(false);
        }
    };

    const addComponent = (id: string, componentType: BlockComponentType) => {
        const componentBlock: ComponentBlock = {
            id: generateUniqueID(),
            type: componentType.type,
            data: {},
            widthInitialSizeValue: componentType.widthInitialSizeValue,
            heightInitialSizeValue: componentType.heightInitialSizeValue
        };
        switch (componentType.type) {
            case BlockTypes.PARAGRAPH:
                componentBlock.data = {
                    text: "Hello, World!"
                };
            }
        setRootBlocks(prev => {
            const newRootBlocks = [...prev];
            const index = newRootBlocks.findIndex((el) => el.internalId === id);
            newRootBlocks.splice(index + 1, 0, {
                internalId: generateUniqueID(),
                component: componentBlock
            });
            return newRootBlocks;
        });
    }

    const keys = createMemo(() => rootBlocks().map((el) => el.internalId));

    const map = createMemo(() => {
        const map = new Map<string, internalBlock>();
        rootBlocks().forEach((item) => map.set(item.internalId, item));
        return map;
    });

    onMount(() => {
        setRootBlocks([{ 
            internalId: generateUniqueID(),
        }]);

        document.addEventListener("dblclick", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
    });

    onCleanup(() => {
        document.removeEventListener("dblclick", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
    });

    return (
        <Scrollable class="[&::-webkit-scrollbar]:w-3 w-full relative">
                <div 
                    class="pb-6 px-12 flex flex-col items-center space-y-4 shadow rounded mb-2 bg-gray-50 w-full max-w-[calc(100%-2rem)]"
                    ref={sectionRef}
                >
                    <For each={keys()}>
                        {(key) => {
                            const item = map().get(key);
                            return (
                                <div 
                                    class="transition-transform duration-500 w-full flex flex-col items-center justify-center"
                                    classList={{
                                        "scale-0": deleting() === item?.component?.id,
                                        // "scale-100": deleting() !== item?.component?.id, // DON'T DO THIS
                                        "pointer-events-none": deleting() === item?.component?.id
                                    }}
                                >
                                    <Show when={item?.component}>
                                        <BlockComponent 
                                            component={item?.component!}
                                            handleAddBlock={(id) => setAddOpen({ open: true, id })} 
                                            addOpen={addOpen().open && addOpen().id === item?.component?.id!}
                                            isRootBlock={true}
                                            handleDeleteBlock={(id) => {
                                                handleDeleteBlock(id);
                                            }}
                                        />
                                    </Show>
                                    
                                    <BlockPlus
                                        id={item?.internalId!}
                                        handleAddBlock={(id: string) => setAddOpen({ open: true, id: id })}
                                        addOpen={addOpen().open && addOpen().id === item?.internalId!}
                                    />
                                </div>
                            );
                        }}
                    </For>
                </div>
                <ComponentAdder 
                    addOpen={addOpen()}
                    setAddOpen={setAddOpen}
                    addModalRef={addModalRef}
                    addComponent={addComponent}
                />
        </Scrollable>
    );
}