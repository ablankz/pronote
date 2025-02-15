import { Accessor, batch, createEffect, createSignal, Setter, Signal, untrack } from "solid-js";
import { generateUniqueID } from "../../../utils/generate";
import { FlexibleText, FlexibleTextStyles } from "../../../renderer/text/types";
import { 
    currentStyle,
    rangeFontBoldStyleUpdate, 
    rangeFontColorStyleUpdate, 
    rangeFontFamilyStyleUpdate, 
    rangeFontItalicStyleUpdate, 
    rangeFontSizeStyleUpdate, 
    rangeFontStrikeThroughStyleUpdate, 
    rangeFontUnderlineStyleUpdate, 
    rangeHighlightColorStyleUpdate, 
} from "../store";
import { RangeWithCurrent } from "../../../types/generic";
import { equalFlexibleTextStyles, nullableToDefaultFlexibleTextStyles } from "../../../renderer/text/utils";
import { DefaultFlexibleTextStyles } from "../../../renderer/text/const";
import { RangeSelectedState } from "../type";

export function useStyleUpdatable(
    textZoneId: Accessor<string>,
    cursorPos: Accessor<number | RangeWithCurrent | null>,
    rangeSelected: Accessor<RangeSelectedState | null>,
    setBatchSelectCursorPos: Setter<{
        from: number,
        to: number,
    } | null>,
    setCaretColor: Setter<string|null>,
    textBlockSig: Signal<FlexibleText[]>,
) {
    const [validStyles, setValidStyles] = createSignal<{
        working: FlexibleTextStyles,
        current: FlexibleTextStyles,
        isNeedUpdate: boolean,
    }>({working: DefaultFlexibleTextStyles, current: DefaultFlexibleTextStyles, isNeedUpdate: false });

    const rangeUpdate = (
        newBlockFactory: (block: FlexibleText) => FlexibleText,
    ) => {
        const [textBlock, setTextBlock] = textBlockSig;
        const cursor = cursorPos();
        if (cursor === null || typeof cursor === "number") return;
        const from = cursor.start;
        const to = cursor.end;
        const newBlocksMap: Map<string, FlexibleText[]> = new Map();
        rangeSelected()!.editingContents.forEach(range => {
            const editingBlock = textBlock()[range.blockIndex];
            if (range!.isFullLine) {
                let newBlock: FlexibleText = {
                    ...editingBlock,
                    version: editingBlock.version + 1,
                };
                newBlock = newBlockFactory(newBlock);
                newBlocksMap.set(editingBlock.id, [newBlock]);
            } else {
                const beforeText = editingBlock.text.slice(0, range.textFrom);
                const rangeText = editingBlock.text.slice(range.textFrom, range.textTo);
                const afterText = editingBlock.text.slice(range.textTo);
                let newBlock: FlexibleText = {
                    ...editingBlock,
                    text: rangeText,
                    version: editingBlock.version + 1,
                };
                newBlock = newBlockFactory(newBlock);
                const newBlocks: FlexibleText[] = [newBlock];
                if (beforeText.length !== 0) {
                    newBlocks.unshift({
                        ...editingBlock,
                        text: beforeText,
                        id: generateUniqueID(),
                        version: 0,
                    });
                }
                if (afterText.length !== 0) {
                    newBlocks.push({
                        ...editingBlock,
                        text: afterText,
                        id: generateUniqueID(),
                        version: 0,
                    });
                }
                newBlocksMap.set(editingBlock.id, newBlocks);
            }
        });
        batch(() => {
            setTextBlock(prev => {
                const newBlocks: FlexibleText[] = [];
                prev.forEach(block => {
                    if (newBlocksMap.has(block.id)) {
                        newBlocks.push(...newBlocksMap.get(block.id)!);
                    } else {
                        newBlocks.push(block);
                    }
                });
                return newBlocks;
            });
            setBatchSelectCursorPos({
                from,
                to,
            });
        });
    }

    createEffect(() => {
        if (rangeFontColorStyleUpdate() !== null) {
            untrack(() => {
                if (
                    rangeSelected() === null 
                    || rangeFontColorStyleUpdate()?.id !== textZoneId()
                    || rangeFontColorStyleUpdate()?.color === undefined
                ) return;
                const newBlockFactory = (block: FlexibleText) => {
                    return {
                        ...block,
                        fontColor: rangeFontColorStyleUpdate()!.color!,
                    };
                };
                rangeUpdate(newBlockFactory);
            });
        }
    });

    createEffect(() => {
        if (rangeHighlightColorStyleUpdate() !== null) {
            untrack(() => {
                if (
                    rangeSelected() === null 
                    || rangeHighlightColorStyleUpdate()?.id !== textZoneId()
                    || rangeHighlightColorStyleUpdate()?.color === undefined
                ) return;
                const newBlockFactory = (block: FlexibleText) => {
                    return {
                        ...block,
                        highlightColor: rangeHighlightColorStyleUpdate()!.color!,
                    };
                };
                rangeUpdate(newBlockFactory);
            });
        }
    });

    createEffect(() => {
        if (rangeFontBoldStyleUpdate() !== null) {
            untrack(() => {
                if (
                    rangeSelected() === null 
                    || rangeFontBoldStyleUpdate()?.id !== textZoneId()
                ) return;
                let newBlockFactory: (block: FlexibleText) => FlexibleText;
                switch (rangeFontBoldStyleUpdate()!.type) {
                    case "specific":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                bold: rangeFontBoldStyleUpdate()!.bold!,
                            };
                        };
                        break;
                    case "toggle":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                bold: !block.bold,
                            };
                        };
                        break;
                    case "nearTrue":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                bold: !(rangeFontBoldStyleUpdate()!.allTrue!),
                            };
                        };
                        break;
                }
                rangeUpdate(newBlockFactory);
            });
        }
    });

    createEffect(() => {
        if (rangeFontItalicStyleUpdate() !== null) {
            untrack(() => {
                if (
                    rangeSelected() === null 
                    || rangeFontItalicStyleUpdate()?.id !== textZoneId()
                ) return;
                let newBlockFactory: (block: FlexibleText) => FlexibleText;
                switch (rangeFontItalicStyleUpdate()!.type) {
                    case "specific":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                italic: rangeFontItalicStyleUpdate()!.italic!,
                            };
                        };
                        break;
                    case "toggle":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                italic: !block.italic,
                            };
                        };
                        break;
                    case "nearTrue":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                italic: !(rangeFontItalicStyleUpdate()!.allTrue!),
                            };
                        };
                        break;
                }
                rangeUpdate(newBlockFactory);
            });
        }
    });

    createEffect(() => {
        if (rangeFontUnderlineStyleUpdate() !== null) {
            untrack(() => {
                if (
                    rangeSelected() === null 
                    || rangeFontUnderlineStyleUpdate()?.id !== textZoneId()
                ) return;
                let newBlockFactory: (block: FlexibleText) => FlexibleText;
                switch (rangeFontUnderlineStyleUpdate()!.type) {
                    case "specific":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                underline: rangeFontUnderlineStyleUpdate()!.underline!,
                            };
                        };
                        break;
                    case "toggle":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                underline: !block.underline,
                            };
                        };
                        break;
                    case "nearTrue":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                underline: !(rangeFontUnderlineStyleUpdate()!.allTrue!),
                            };
                        };
                        break;
                }
                rangeUpdate(newBlockFactory);
            });
        }
    });

    createEffect(() => {
        if (rangeFontStrikeThroughStyleUpdate() !== null) {
            untrack(() => {
                if (
                    rangeSelected() === null 
                    || rangeFontStrikeThroughStyleUpdate()?.id !== textZoneId()
                ) return;
                let newBlockFactory: (block: FlexibleText) => FlexibleText;
                console.log("rangeFontStrikeThroughStyleUpdate", rangeFontStrikeThroughStyleUpdate());
                switch (rangeFontStrikeThroughStyleUpdate()!.type) {
                    case "specific":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                strikeThrough: rangeFontStrikeThroughStyleUpdate()!.strikeThrough!,
                            };
                        };
                        break;
                    case "toggle":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                strikeThrough: !block.strikeThrough,
                            };
                        };
                        break;
                    case "nearTrue":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                strikeThrough: !(rangeFontStrikeThroughStyleUpdate()!.allTrue!),
                            };
                        };
                        break;
                }
                rangeUpdate(newBlockFactory);
            });
        }
    });

    createEffect(() => {
        if (rangeFontFamilyStyleUpdate() !== null) {
            untrack(() => {
                if (
                    rangeSelected() === null 
                    || rangeFontFamilyStyleUpdate()?.id !== textZoneId()
                    || rangeFontFamilyStyleUpdate()?.fontFamily === undefined
                ) return;
                const newBlockFactory = (block: FlexibleText) => {
                    return {
                        ...block,
                        fontFamily: rangeFontFamilyStyleUpdate()!.fontFamily!,
                    };
                };
                rangeUpdate(newBlockFactory);
            });
        }
    });

    createEffect(() => {
        if (rangeFontSizeStyleUpdate() !== null) {
            untrack(() => {
                console.log("rangeFontSizeStyleUpdate", rangeFontSizeStyleUpdate());
                if (
                    rangeSelected() === null 
                    || rangeFontSizeStyleUpdate()?.id !== textZoneId()
                    || rangeFontSizeStyleUpdate()?.size === undefined
                ) return;
                let newBlockFactory: (block: FlexibleText) => FlexibleText;
                switch (rangeFontSizeStyleUpdate()!.type) {
                    case "specific":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                fontSize: rangeFontSizeStyleUpdate()!.size!,
                            };
                        };
                        break;
                    case "update":
                        newBlockFactory = (block: FlexibleText) => {
                            return {
                                ...block,
                                fontSize: block.fontSize + rangeFontSizeStyleUpdate()!.size!,
                            };
                        };
                        break;
                }
                rangeUpdate(newBlockFactory);
            });
        }
    });

    createEffect(() => {
        const styleState = currentStyle();
        if (styleState.from === textZoneId()) return;
        const newStyle = nullableToDefaultFlexibleTextStyles(styleState.style);
        switch (styleState.selectType) {
            case "range":
                break;
            case "cursor":
            case "none":
                setValidStyles(prev => {
                    const isNeedUpdate = !equalFlexibleTextStyles(prev.working, newStyle);
                    if (isNeedUpdate) {
                        setCaretColor(newStyle.fontColor || "black");
                    }
                    return { 
                        working: prev.working, 
                        current: newStyle, 
                        isNeedUpdate: isNeedUpdate,
                    };
                });
                break;
        }
    });

    const setBlockStyle = (editBlockStyle: FlexibleTextStyles): boolean => {
        let isNeedUpdate = false;
        setValidStyles(prev => {
            if (prev.current === null) return prev;
            if (!equalFlexibleTextStyles(prev.current, editBlockStyle)) {
                isNeedUpdate = true;
                return { working: editBlockStyle, current: editBlockStyle, isNeedUpdate: true };
            }
            return prev;
        });
        return isNeedUpdate;
    }

    const resetBlockStyle = () => {
        setValidStyles(prev => {
            return { working: prev.current, current: prev.current, isNeedUpdate: false };
        });
    }

    return {
        validStyles,
        setBlockStyle,
        resetBlockStyle,
    };
}
