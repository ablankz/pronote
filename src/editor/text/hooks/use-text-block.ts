import { Accessor, batch, createEffect, createSignal, onCleanup, onMount, Signal } from "solid-js";
import { DefaultFlexibleText } from "../../../renderer/text/const";
import { generateUniqueID } from "../../../utils/generate";
import { RangeWithCurrent } from "../../../types/generic";
import { FlexibleText } from "../../../renderer/text/types";
import { setTextRefMap } from "../store";
import { useStyleUpdatable } from "./use-style-updatable";
import { RangeSelectedState } from "../type";
import { useCursorOperator } from "./use-cursor-operator";

interface EditableTextBlock {
    textZoneId: Accessor<string>;
    textBlock: Signal<FlexibleText[]>;
}

export function editableTextBlock(
    el: HTMLElement, 
    value: Accessor<EditableTextBlock>
) {
    const [textBlock, setTextBlock] = value().textBlock;
    const [cursorPos, setCursorPos] = createSignal<number | RangeWithCurrent | null>(null);
    const [isComposing, setIsComposing] = createSignal(false);
    const [caretColor, setCaretColor] = createSignal<string | null>(null);
    const [rangeSelected, setRangeSelected] = createSignal<RangeSelectedState | null>(null);
    const [batchSelectCursorPos, setBatchSelectCursorPos] = createSignal<{
        from: number,
        to: number,
    } | null>(null);

    const {
        validStyles,
        setBlockStyle,
        resetBlockStyle,
    } = useStyleUpdatable(
        value().textZoneId,
        cursorPos,
        rangeSelected,
        setBatchSelectCursorPos,
        setCaretColor,
        [textBlock, setTextBlock],
    );

    const {
        handleSelectionChange,
        editingTextBlock,
        editingTextCursor,
        setEditingTextBlock,
        setEditingTextCursor,
        moveCursorHorizontally,
    } = useCursorOperator(
        el,
        value().textZoneId,
        isComposing,
        setBlockStyle,
        setCaretColor,
        textBlock,
        [cursorPos, setCursorPos],
        setRangeSelected,
        [batchSelectCursorPos, setBatchSelectCursorPos],
    )

    createEffect(() => {
        console.log("textBlock", textBlock());
    });

    const handleCompositionStart = (e: CompositionEvent) => {
        if (document.activeElement !== el) return;
        e.preventDefault();
        setIsComposing(true);
    };
    
    const handleCompositionEnd = (e: CompositionEvent) => {
        if (document.activeElement !== el) return;
        e.preventDefault();

        switch(typeof cursorPos()) {
            case "number":
            insertText(e.data);
            moveCursorHorizontally(true, e.data.length, "forward");
            break;
            case "object":
            break;
        }

        setIsComposing(false);
    };

    const insertText = (text: string): {
        success: boolean,
        cursorMoveNum: {
            insert: number,
            delete: number,
        },
        rangeInserted: boolean,
        range?: {
            isLast: boolean,
        }
    } => {
        if (cursorPos() === null) return { success: false, cursorMoveNum: { insert: 0, delete: 0 }, rangeInserted: false };
        const txtLen = text.length;
        switch (typeof cursorPos()) {
            case "number":
                batch(() => {
                    setTextBlock(prev => {
                        if (prev.length === 0) {
                        text = text + "\n";
                        }
                        if (editingTextBlock() < 0) {
                            return [
                                {
                                    ...DefaultFlexibleText(generateUniqueID()),
                                    ...validStyles().current,
                                    text: text,
                                },
                                ...prev
                            ]
                        }

                        if (validStyles().isNeedUpdate) {
                            const newBlock: FlexibleText = {
                                ...DefaultFlexibleText(generateUniqueID()),
                                ...validStyles().current,
                                text: text,
                            };
                            const editingBlock = prev[editingTextBlock()];
                            const firstText = editingBlock.text.slice(0, editingTextCursor());
                            const secondText = editingBlock.text.slice(editingTextCursor());
                            const isLastBlock = editingTextBlock() === prev.length - 1;
                            if (isLastBlock && secondText === "\n") {
                                const newBlocks: FlexibleText[] = [
                                {
                                    ...editingBlock,
                                    text: firstText,
                                    version: editingBlock.version + 1,
                                },
                                {
                                    ...newBlock,
                                    text: newBlock.text + "\n",
                                }
                                ];
                                return [
                                ...prev.slice(0, editingTextBlock()),
                                ...newBlocks,
                                ];
                            } else if (secondText === "\n") {
                                const newBlocks: FlexibleText[] = [
                                {
                                    ...editingBlock,
                                    text: firstText,
                                    version: editingBlock.version + 1,
                                },
                                {
                                    ...newBlock,
                                    text: newBlock.text + "\n",
                                }
                                ];
                                return [
                                ...prev.slice(0, editingTextBlock()),
                                ...newBlocks,
                                ...prev.slice(editingTextBlock() + 1),
                                ];
                            } else if (firstText.length === 0) {
                                return [
                                ...prev.slice(0, editingTextBlock()),
                                newBlock,
                                ...prev.slice(editingTextBlock()),
                                ];
                            } else if (secondText.length === 0) {
                                return [
                                ...prev.slice(0, editingTextBlock() + 1),
                                newBlock,
                                ...prev.slice(editingTextBlock() + 1),
                                ];
                            } else {
                                const newBlocks: FlexibleText[] = [
                                {
                                    ...editingBlock,
                                    text: firstText,
                                    version: editingBlock.version + 1,
                                },
                                newBlock,
                                {
                                    ...editingBlock,
                                    text: secondText,
                                    id: generateUniqueID(),
                                    version: 0,
                                },
                                ];
                                return [
                                ...prev.slice(0, editingTextBlock()),
                                ...newBlocks,
                                ...prev.slice(editingTextBlock() + 1),
                                ];
                            }
                        } else {
                        const editingBlock = prev[editingTextBlock()];
                        const newText = 
                            editingBlock.text.slice(0, editingTextCursor()) + text + editingBlock.text.slice(editingTextCursor());
                        const newBlock: FlexibleText = {
                            ...editingBlock,
                            text: newText,
                            version: editingBlock.version + 1,
                        };
                        return prev.map((block, index) => index === editingTextBlock() ? newBlock : block);
                    }
                });
                setCaretColor(null);
                resetBlockStyle();
            });
            return { success: true, cursorMoveNum: { insert: txtLen, delete: 0 }, rangeInserted: false };
        case "object":
            const rangeSelectionState = rangeSelected();
            if (rangeSelectionState === null) return { success: false, cursorMoveNum: { insert: 0, delete: 0 }, rangeInserted: false };
            const rangeSelectionRange = rangeSelectionState.editingContents;
            if (rangeSelectionRange.length === 0) return { success: false, cursorMoveNum: { insert: 0, delete: 0 }, rangeInserted: false };
            let deletedNum = 0;
            batch(() => {
                setTextBlock(prev => {
                    const deleteLists: number[] = [];
                    const lastRangeIndex = rangeSelectionRange.length - 1;
                    const lastRangeLastNewLine = rangeSelectionRange[lastRangeIndex].lastNewLineSelected;
                    let firstBlock: {
                        index: number,
                        preText: string,
                        afterText: string,
                    } | undefined;
                    rangeSelectionRange.forEach((rangeSelection, index) => {
                        if (index === 0) {
                            const editingBlockText = prev[rangeSelection.blockIndex].text;
                            const from = rangeSelection.textFrom;
                            const to = rangeSelection.textTo;
                            let preText = editingBlockText.slice(0, from);
                            let afterText = editingBlockText.slice(to);
                            deletedNum += to - from;
                            if (rangeSelection.lastNewLineSelected) {
                                afterText = afterText + "\n";
                            }
                            firstBlock = {
                                index: rangeSelection.blockIndex,
                                preText: preText,
                                afterText: afterText,
                            };
                            return;
                        }
                        if (rangeSelection.isFullLine) {
                            deleteLists.push(rangeSelection.blockIndex);
                            deletedNum += prev[rangeSelection.blockIndex].text.length;
                            if (index === 0 && lastRangeLastNewLine) {
                                const firstPrevBlock = prev[rangeSelection.blockIndex - 1];
                                if (!firstPrevBlock) return;
                                const firstPrevNewText = firstPrevBlock.text + "\n";
                                prev = prev.map((block, index) => index === rangeSelection.blockIndex - 1 ? {
                                ...firstPrevBlock,
                                text: firstPrevNewText,
                                version: firstPrevBlock.version + 1,
                                } : block);
                            }
                            return;
                        }
                        const editingBlock = prev[rangeSelection.blockIndex];
                        let newText = 
                        editingBlock.text.slice(0, rangeSelection.textFrom) + editingBlock.text.slice(rangeSelection.textTo);
                        if (newText.length === 0) {
                        deleteLists.push(rangeSelection.blockIndex);
                        } else {
                            deletedNum += rangeSelection.textTo - rangeSelection.textFrom;
                            if (index === 0 && lastRangeLastNewLine) {
                                newText = newText + "\n";
                            }
                            const newBlock: FlexibleText = {
                                ...editingBlock,
                                text: newText,
                                version: editingBlock.version + 1,
                            };
                            prev = prev.map((block, index) => index === rangeSelection.blockIndex ? newBlock : block);
                        }
                    });
                    if (firstBlock !== undefined) {
                        const newText = firstBlock.preText + text + firstBlock.afterText;
                        const newBlock: FlexibleText = {
                            ...prev[firstBlock.index],
                            text: newText,
                            version: prev[firstBlock.index].version + 1,
                        };
                        prev = prev.map((block, index) => index === firstBlock!.index ? newBlock : block);
                    }
                    return prev.filter((_, index) => !deleteLists.includes(index));
                });
                setCaretColor(null);
                setRangeSelected(null);
            });
            return { 
                success: true, 
                cursorMoveNum: { insert: txtLen, delete: deletedNum },
                rangeInserted: true, 
                range: { isLast: rangeSelectionState.isLast } 
            };
        }
    };

    const deleteText = (size: number, direction: "forward" | "backward"): {
        success: boolean,
        deleted: number,
        rangeDeleted: boolean,
        range?: {
        isLast: boolean,
        }
    } => {
        if (cursorPos() === null) return { success: false, deleted: 0, rangeDeleted: false };
        switch (typeof cursorPos()) {
        case "number":
            batch(() => {
                setTextBlock(prev => {
                    let remainNewLine = false;
                    let editingTextBlockIndex = editingTextBlock();
                    let editingBlock = prev[editingTextBlockIndex];
                    let newText: string, currentTextCursor: number, firstDel = false;
                    if (editingTextBlockIndex === 0 && direction === "backward"
                            && editingTextCursor() > 0 && editingTextCursor() <= size) {
                            firstDel = true;
                            newText = editingBlock.text.slice(editingTextCursor());

                            currentTextCursor = 0;
                    } else if ((editingTextCursor() <= 0 && direction === "backward")
                            || editingTextCursor() < 0) {
                        if (editingTextBlockIndex <= 0) {
                            return prev;
                        }
                        const afterDeleted = prev[editingTextBlockIndex - 1].text.length - size;
                        const blockBreak = afterDeleted < 0;
                        const onlyNewLine = editingBlock.text.length === 1 && editingBlock.text[0] === "\n";
                        if (!blockBreak && !onlyNewLine) {
                            editingTextBlockIndex -= 1;
                            editingBlock = prev[editingTextBlockIndex];
                            if(editingBlock.text[editingBlock.text.length - 1] === "\n") {
                            newText = editingBlock.text.slice(0, editingBlock.text.length - 1);
                            currentTextCursor = newText.length;
                            } else {
                            newText = editingBlock.text + editingBlock.text.slice(0, size);
                            currentTextCursor = editingBlock.text.length;
                            }
                        } else {
                            prev = prev.filter((_, index) => index !== editingTextBlockIndex);
                            editingTextBlockIndex -= 1;
                            editingBlock = prev[editingTextBlockIndex];

                            if (onlyNewLine && editingBlock.text[editingBlock.text.length - 1] === "\n") {
                            newText = editingBlock.text;
                            currentTextCursor = editingBlock.text.length;
                            } else if(editingBlock.text[editingBlock.text.length - 1] === "\n") {
                            newText = editingBlock.text.slice(0, editingBlock.text.length - 1);
                            currentTextCursor = newText.length;
                            } else {
                            newText = editingBlock.text + editingBlock.text.slice(0, size);
                            currentTextCursor = editingBlock.text.length;
                            }
                        }
                    } else if((editingTextCursor() <= size && direction === "backward")
                            || editingTextCursor() < size) {
                        const prevBlock = prev[editingTextBlockIndex - 1];
                        const isPrevLastNewLine = prevBlock.text[prevBlock.text.length - 1] === "\n";
                        newText = direction === "forward" ? 
                        editingBlock.text.slice(0, editingTextCursor()) + editingBlock.text.slice(editingTextCursor() + size) 
                        : editingBlock.text.slice(0, editingTextCursor() - size) + editingBlock.text.slice(editingTextCursor());
                        if (isPrevLastNewLine) {
                            remainNewLine = true;
                        } else {
                            if (newText === "\n") {
                            const updatedPrevBlock: FlexibleText = {
                                ...prevBlock,
                                text: prevBlock.text + "\n",
                                version: prevBlock.version + 1,
                            };
                            prev = prev.map((block, index) => index === editingTextBlockIndex - 1 ? updatedPrevBlock : block);
                            }
                        }
                    
                        currentTextCursor = direction === "forward" ? editingTextCursor() : editingTextCursor() - size;
                    } else {
                        newText = direction === "forward" ? 
                            editingBlock.text.slice(0, editingTextCursor()) + editingBlock.text.slice(editingTextCursor() + size) 
                            : editingBlock.text.slice(0, editingTextCursor() - size) + editingBlock.text.slice(editingTextCursor());
                        
                        currentTextCursor = direction === "forward" ? editingTextCursor() : editingTextCursor() - size;
                    }

                    if (currentTextCursor <= 0 && !firstDel) {
                        batch(() => {
                            setEditingTextCursor(0);
                            setEditingTextBlock(editingTextBlockIndex);
                        });
                    }

                    const onlyNewLine = newText.length === 1 && newText[0] === "\n";
                    if ((newText.length === 0 )) {
                        return prev.filter((_, index) => index !== editingTextBlockIndex);
                    }else if (onlyNewLine && !remainNewLine) {
                        return prev.filter((_, index) => index !== editingTextBlockIndex);
                    }
                    
                    const newBlock: FlexibleText = {
                        ...editingBlock,
                        text: newText,
                        version: editingBlock.version + 1,
                    };
                    return prev.map((block, index) => index === editingTextBlockIndex ? newBlock : block);
                });
                setCaretColor(null);
            });
            return { success: true, deleted: size, rangeDeleted: false };
        case "object":
            const selected = rangeSelected();
            if (selected === null) return { success: false, deleted: 0, rangeDeleted: false };
            const rangeSelectionRange = selected.editingContents;
            if (rangeSelectionRange.length === 0) return { success: false, deleted: 0, rangeDeleted: false };
            let deletedNum = 0;
            batch(() => {
                setTextBlock(prev => {
                    const deleteLists: number[] = [];
                    const lastRangeIndex = rangeSelectionRange.length - 1;
                    const lastRangeLastNewLine = rangeSelectionRange[lastRangeIndex].lastNewLineSelected;
                    rangeSelectionRange.forEach((rangeSelection, index) => {
                        if (rangeSelection.isFullLine) {
                        deleteLists.push(rangeSelection.blockIndex);
                        deletedNum += prev[rangeSelection.blockIndex].text.length;
                        if (index === 0 && lastRangeLastNewLine) {
                            const firstPrevBlock = prev[rangeSelection.blockIndex - 1];
                            if (!firstPrevBlock) return;
                            const firstPrevNewText = firstPrevBlock.text + "\n";
                            prev = prev.map((block, index) => index === rangeSelection.blockIndex - 1 ? {
                            ...firstPrevBlock,
                            text: firstPrevNewText,
                            version: firstPrevBlock.version + 1,
                            } : block);
                        }
                        return;
                        }
                        const editingBlock = prev[rangeSelection.blockIndex];
                        let newText = 
                        editingBlock.text.slice(0, rangeSelection.textFrom) + editingBlock.text.slice(rangeSelection.textTo);
                        if (newText.length === 0) {
                        deleteLists.push(rangeSelection.blockIndex);
                        } else {
                        deletedNum += rangeSelection.textTo - rangeSelection.textFrom;
                        if (index === 0 && lastRangeLastNewLine) {
                            newText = newText + "\n";
                        }
                        const newBlock: FlexibleText = {
                            ...editingBlock,
                            text: newText,
                            version: editingBlock.version + 1,
                        };
                        prev = prev.map((block, index) => index === rangeSelection.blockIndex ? newBlock : block);
                    }
                });
                return prev.filter((_, index) => !deleteLists.includes(index));
                });
                setCaretColor(null);
                setRangeSelected(null);
            });
            return { success: true, deleted: deletedNum, rangeDeleted: true, range: { isLast: selected.isLast } };
        }
    };

    const saveStyledText = (e: KeyboardEvent) => {
        if (document.activeElement !== el) return;
        switch (e.key) {
        case "ArrowUp":
            return;
        case "ArrowDown":
            return;
        case "ArrowLeft":
            return;
        case "ArrowRight":
            return;
        }

        e.preventDefault();
        if (isComposing()) return;

        let deleted: {
            success: boolean,
            deleted: number,
            rangeDeleted: boolean,
            range?: {
                isLast: boolean,
            }
        }
        let moved: {
            success: boolean,
            cursorMoveNum: {
                insert: number,
                delete: number,
            }
            rangeInserted: boolean,
            range?: {
                isLast: boolean,
            }
        };

        switch (e.key) {
        case "Backspace":
            deleted = deleteText(1, "backward");
            if (!deleted.success || !deleted.deleted) return;
            deleted.rangeDeleted ?
                moveCursorHorizontally(true, 0, "backward")
                : moveCursorHorizontally(true, deleted.deleted, "backward");
            return;
        case "Enter":
            moved = insertText("\n");
            if (!moved.success) return;
            if (moved.rangeInserted) {
                moved.cursorMoveNum.insert && moveCursorHorizontally(true, -moved.cursorMoveNum.insert, "backward");
            } else {
                moved.cursorMoveNum.insert && moveCursorHorizontally(true, moved.cursorMoveNum.insert, "forward");
            }
            return;
        case "Tab":
            moved = insertText("\t");
            if (!moved.success) return;
            if (moved.rangeInserted) {
                moved.cursorMoveNum.insert && moveCursorHorizontally(true, -moved.cursorMoveNum.insert, "backward");
            } else {
                moved.cursorMoveNum.insert && moveCursorHorizontally(true, moved.cursorMoveNum.insert, "forward");
            }
            return;
        default:
            if (e.key.length === 1) {
                const ctrKey = e.ctrlKey
                const metaKey = e.metaKey;
                const altKey = e.altKey;
                const shiftKey = e.shiftKey;
                moved = insertText(e.key);
                if (!moved.success) return;
                if (moved.rangeInserted) {
                    moved.cursorMoveNum.insert && moveCursorHorizontally(true, -moved.cursorMoveNum.insert, "backward");
                } else {
                    moved.cursorMoveNum.insert && moveCursorHorizontally(true, moved.cursorMoveNum.insert, "forward");
                }
            }
            return;
        }
    };

    el.addEventListener("keydown", saveStyledText);
    el.addEventListener("compositionstart", handleCompositionStart);
    el.addEventListener("compositionend", handleCompositionEnd);
    el.addEventListener("input", (e) => {
        e.preventDefault();
    });
    
    createEffect(() => {
        caretColor() !== null ?
            el.style.setProperty("caret-color", caretColor())
            : el.style.removeProperty("caret-color");
    });

    onMount(() => {
        document.addEventListener("selectionchange", handleSelectionChange);
        setTextRefMap(prev => {
            prev.set(value().textZoneId(), el);
            return prev;
        });
    });

    onCleanup(() => {
        document.removeEventListener("selectionchange", handleSelectionChange);
        setTextRefMap(prev => {
            prev.delete(value().textZoneId());
            return prev;
        });
    });
}

declare module "solid-js" {
    namespace JSX {
        interface Directives {
            editableTextBlock: EditableTextBlock;
        }
    }
}