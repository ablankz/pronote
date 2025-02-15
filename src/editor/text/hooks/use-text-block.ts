import { Accessor, batch, createEffect, createSignal, onCleanup, onMount, Signal, untrack } from "solid-js";
import { DefaultFlexibleText, DefaultFlexibleTextStyles } from "../../../renderer/text/const";
import { generateUniqueID } from "../../../utils/generate";
import { RangeWithCurrent } from "../../../types/generic";
import { FlexibleText, FlexibleTextStyles, NullableFlexibleTextStyles } from "../../../renderer/text/types";
import { 
    currentStyle, 
    editableTextRef, 
    rangeFontColorStyleUpdate, 
    setCurrentStyle, 
    setEditableTextRef, 
    setTextRefMap 
} from "../store";
import { selectCursorPos } from "../utils";
import { 
    equalFlexibleTextStyles, 
    equalOverrideFlexibleTextStyles, 
    extractStyleFromFlexibleText, 
    nullableToDefaultFlexibleTextStyles 
} from "../../../renderer/text/utils";

interface EditableTextBlock {
    textZoneId: Accessor<string>;
    textBlock: Signal<FlexibleText[]>;
}

interface rangeSelectedState {
    isLast: boolean;
    overStyle: NullableFlexibleTextStyles;
    editingContents: {
        blockIndex: number;
        textFrom: number;
        textTo: number;
        isFullLine: boolean;
        blockStyle: FlexibleTextStyles;
        lastNewLineSelected: boolean;
    }[];
}

export function editableTextBlock(
    el: HTMLElement, 
    value: Accessor<EditableTextBlock>
) {
    const [textBlock, setTextBlock] = value().textBlock;
    const [editingTextCursor, setEditingTextCursor] = createSignal<number>(0);
    const [editingTextBlock, setEditingTextBlock] = createSignal<number>(0);
    const [arrowSelection, setArrowSelection] = createSignal(false);
    const [cursorPos, setCursorPos] = createSignal<number | RangeWithCurrent | null>(null);
    const [isComposing, setIsComposing] = createSignal(false);
    const [validStyles, setValidStyles] = createSignal<{
        working: FlexibleTextStyles,
        current: FlexibleTextStyles,
        isNeedUpdate: boolean,
    }>({working: DefaultFlexibleTextStyles, current: DefaultFlexibleTextStyles, isNeedUpdate: false });
    const [caretColor, setCaretColor] = createSignal<string | null>(null);
    const [rangeSelected, setRangeSelected] = createSignal<rangeSelectedState | null>(null);
    const [batchSelectCursorPos, setBatchSelectCursorPos] = createSignal<{
        from: number,
        to: number,
    } | null>(null);

    createEffect(() => {
        if (rangeFontColorStyleUpdate() !== null) {
            untrack(() => {
                if (
                    rangeSelected() === null 
                    || rangeFontColorStyleUpdate()?.id !== value().textZoneId()
                    || rangeFontColorStyleUpdate()?.color === undefined
                ) return;
                const cursor = cursorPos();
                if (cursor === null || typeof cursor === "number") return;
                const from = cursor.start;
                const to = cursor.end;
                const newBlocksMap: Map<string, FlexibleText[]> = new Map();
                rangeSelected()!.editingContents.forEach(range => {
                    const editingBlock = textBlock()[range.blockIndex];
                    if (range!.isFullLine) {
                        const newBlock: FlexibleText = {
                        ...editingBlock,
                        fontColor: rangeFontColorStyleUpdate()!.color!,
                        version: editingBlock.version + 1,
                        };
                        newBlocksMap.set(editingBlock.id, [newBlock]);
                    } else {
                        const beforeText = editingBlock.text.slice(0, range.textFrom);
                        const rangeText = editingBlock.text.slice(range.textFrom, range.textTo);
                        const afterText = editingBlock.text.slice(range.textTo);
                        const newBlocks: FlexibleText[] = [
                        {
                            ...editingBlock,
                            text: beforeText,
                            version: editingBlock.version + 1,
                        },
                        {
                            ...editingBlock,
                            id: generateUniqueID(),
                            text: rangeText,
                            fontColor: rangeFontColorStyleUpdate()!.color!,
                            version: 0,
                        },
                        {
                            ...editingBlock,
                            id: generateUniqueID(),
                            text: afterText,
                            version: 0,
                        }
                        ];
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
            });
        }
    });

    createEffect(() => {
        if (batchSelectCursorPos() !== null) {
            batch(() => {
                selectCursorPos(batchSelectCursorPos()!.from, batchSelectCursorPos()!.to, el);
                setBatchSelectCursorPos(null);
            });
        }
    });

    createEffect(() => {
        const styleState = currentStyle();
        if (styleState.from === value().textZoneId()) return;
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

    const saveCursorPosition = () => {
        if (isComposing()) return;
        if (arrowSelection()) {
            setArrowSelection(false);
            return;
        }

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);

        const preCaretRangeRight = range.cloneRange();
        el && preCaretRangeRight.selectNodeContents(el);
        preCaretRangeRight.setEnd(range.endContainer, range.endOffset);
        const rightIndex = preCaretRangeRight.toString().length;

        const preCaretRangeLeft = range.cloneRange();
        el && preCaretRangeLeft.selectNodeContents(el);
        preCaretRangeLeft.setEnd(range.startContainer, range.startOffset);
        const leftIndex = preCaretRangeLeft.toString().length;

        if (selection.isCollapsed) {
            batch(() => {
                setCursorPos(rightIndex);
            });
        } else {
            batch(() => {
                setCursorPos(prev => {
                    if (prev === null) {
                    return null;
                    }
                    let from: number, to: number, direction: "forward" | "backward";
                    switch (typeof prev) {
                        case "number":
                        if (rightIndex > prev) {
                            direction = "forward";
                        } else {
                            direction = "backward";
                        }
                        return { start: leftIndex, end: rightIndex, direction: direction, current: rightIndex };
                        case "object":
                        let size: number;
                        if (prev.direction === "forward") {
                            if (rightIndex > prev.current) {
                            return { start: leftIndex, end: rightIndex, direction: "forward", current: rightIndex };
                            } else {
                            size = prev.current - rightIndex;
                            from = prev.start;
                            to = Math.max(prev.end - size, 0);
                            if (from >= to) {
                                return { start: to, end: from, direction: "backward", current: leftIndex };
                            }else {
                                return { start: from, end: to, direction: "forward", current: rightIndex };
                            }
                            }
                        } else {
                            if (leftIndex < prev.current) {
                            return { start: leftIndex, end: rightIndex, direction: "backward", current: leftIndex };
                            } else {
                            size = leftIndex - prev.current;
                            from = Math.min(prev.start + size, el?.textContent?.length || 0);
                            to = prev.end;
                            if (from >= to) {
                                return { start: to, end: from, direction: "forward", current: rightIndex };
                            } else {
                                return { start: from, end: to, direction: "backward", current: leftIndex };
                            }
                            }
                        }
                    }
                });
            });
        }
    };

    const handleCursorPos = () => {
        if (isComposing() || cursorPos() === null) {
            return
        } else {
            const blocks = untrack(textBlock);
            let editBlockStyle: FlexibleTextStyles = DefaultFlexibleTextStyles;
            switch (typeof cursorPos()) {
                case "number":
                    const cursorOffset: number = Number(cursorPos());
                    let editingBlock = -1, textIndex = -1;
                    blocks.reduce((acc, block, iter) => {
                        const after = acc + block.text.length;
                        const condition = (acc < cursorOffset && after >= cursorOffset)
                        || (iter === 0 && acc <= cursorOffset && after >= cursorOffset);
                        if (condition) {
                        textIndex = cursorOffset - acc;
                        editingBlock = iter;
                        if (textIndex === block.text.length && block.text[textIndex-1] === "\n") {
                            if (iter !== blocks.length - 1) {
                            textIndex = 0;
                            editingBlock = iter + 1;
                            }
                        }
                        return after;
                        }
                        return after;
                    }, 0);
                    if (editingBlock >= 0) {
                        const editBlock = blocks[editingBlock];
                        editBlockStyle = {
                        ...extractStyleFromFlexibleText(editBlock),
                        }
                    }
                    batch(() => {
                        setCaretColor(null);
                        setEditingTextBlock(editingBlock);
                        setEditingTextCursor(textIndex);
                        let isNeedUpdate = false;
                        setValidStyles(prev => {
                            if (prev.current === null) return prev;
                            if (!equalFlexibleTextStyles(prev.current, editBlockStyle)) {
                                isNeedUpdate = true;
                                return { working: editBlockStyle, current: editBlockStyle, isNeedUpdate: true };
                            }
                            return prev;
                        });
                        isNeedUpdate && setCurrentStyle({
                            style: editBlockStyle,
                            selectType: "cursor",
                            from: value().textZoneId(),
                        });
                    });
                    break;
                case "object":
                    const range = cursorPos() as RangeWithCurrent;
                    const from = range.start;
                    const to = range.end;
                    const isLast = range.end === range.current;
                    let rangeEditingContents: {
                        blockIndex: number;
                        textFrom: number;
                        textTo: number;
                        isFullLine: boolean;
                        blockStyle: FlexibleTextStyles;
                        lastNewLineSelected: boolean;
                    }[] = [];
                    let overStyle: NullableFlexibleTextStyles = {};
                    let selectionRangeStatus: "none" | "range" | "full" = "none";
                    blocks.reduce((acc, block, iter) => {
                        const after = acc + block.text.length;
                        const fromCondition = after > from;
                        const lastChar = block.text[block.text.length - 1];
                        let lastNewLineSelected = false;
                        if (lastChar === "\n" && after - 1 === to) {
                        lastNewLineSelected = true;
                        }
                        if (fromCondition && selectionRangeStatus === "none") {
                        const textFrom = from - acc;
                        let textTo;
                        if (lastNewLineSelected) {
                            selectionRangeStatus = "full";
                            textTo = block.text.length;
                        } else if (after >= to) {
                            selectionRangeStatus = "full";
                            textTo = to - acc;
                        } else {
                            selectionRangeStatus = "range";
                            textTo = block.text.length;
                        }
                        let fullLine = false; 
                        if (textFrom === 0 && (textTo === block.text.length || lastNewLineSelected)) {
                            fullLine = true;
                        }
                        let blockStyle = extractStyleFromFlexibleText(block);
                        rangeEditingContents.push({
                            blockIndex: iter,
                            textFrom: textFrom,
                            textTo: textTo,
                            isFullLine: fullLine,
                            blockStyle,
                            lastNewLineSelected,
                        });
                        overStyle = blockStyle;
                        return after;
                        }
                        if (selectionRangeStatus === "range") {
                        let blockStyle = extractStyleFromFlexibleText(block);
                        overStyle = equalOverrideFlexibleTextStyles(overStyle, blockStyle);
                        if (lastNewLineSelected) {
                            rangeEditingContents.push({
                            blockIndex: iter,
                            textFrom: 0,
                            textTo: block.text.length,
                            isFullLine: true,
                            blockStyle,
                            lastNewLineSelected,
                            });
                            selectionRangeStatus = "full";
                            return after;
                        }
                        const toCondition = (after >= to);
                        if (toCondition) {
                            const textTo = to - acc;
                            rangeEditingContents.push({
                            blockIndex: iter,
                            textFrom: 0,
                            textTo: textTo,
                            isFullLine: after === to,
                            blockStyle,
                            lastNewLineSelected,
                            });
                            selectionRangeStatus = "full";
                            return after;
                        } else {
                            rangeEditingContents.push({
                            blockIndex: iter,
                            textFrom: 0,
                            textTo: block.text.length,
                            isFullLine: true,
                            blockStyle,
                            lastNewLineSelected,
                            });
                            return after;
                        }
                        }
                        return after;
                    }, 0);
                    batch(() => {
                        setCaretColor(null);
                        setRangeSelected({
                            overStyle: overStyle,
                            editingContents: rangeEditingContents,
                            isLast,
                        });
                        setCurrentStyle({
                            style: overStyle,
                            selectType: "range",
                            from: value().textZoneId(),
                        });
                    });
                    break;
            }
        }
    };

    createEffect(() => {
        handleCursorPos();
    });

    const moveCursorHorizontally = (
        collapsing: boolean, 
        size: number, 
        direction: "forward" | "backward",
    ) => {
    if (!el) return;

    if (collapsing) {
        batch(() => {
        setArrowSelection(true);
        setCursorPos(prev => {
            if (prev === null) {
            return null
            } else {
            let offset;
            switch (typeof prev) {
                case "number":
                    offset = direction === "forward" ? Math.min(
                        prev + size, el.textContent?.length || 0
                    ) : Math.max(prev - size, 0);
                    selectCursorPos(offset, offset, el);
                    return offset;
                case "object":
                    if (direction === "forward") {
                        offset = prev.end;
                    } else {
                        offset = prev.start;
                    }
                    selectCursorPos(offset, offset, el);
                    return offset;
            }
            }
        });
        });
    } else {
        batch(() => {
        setArrowSelection(true);
        setCursorPos(prev => {
            if (prev === null) {
            return null
            } else {
            switch (typeof prev) {
                case "number":
                    let from: number, to: number, current: number;
                    if (direction === "forward") {
                        from = prev;
                        to = Math.min(prev + size, el.textContent?.length || 0);
                        current = to;
                    } else {
                        from = Math.max(prev - size, 0);
                        to = prev;
                        current = from;
                    }
                    selectCursorPos(from, to, el);
                    return { start: from, end: to, direction: direction, current: current };
                case "object":
                    if (direction === prev.direction) {
                        let from: number, to: number, current: number;
                        if (direction === "forward") {
                        from = prev.start;
                        to = Math.min(prev.end + size, el.textContent?.length || 0);
                        current = to;
                        } else {
                        from = Math.max(prev.start - size, 0);
                        to = prev.end;
                        current = from;
                        }
                        selectCursorPos(from, to, el);
                        return { start: from, end: to, direction: direction, current: current };
                    } else {
                        let from: number, to: number, current: number;
                        let reverse = false;
                        if (prev.direction === "forward") {
                        from = prev.start;
                        to = Math.max(prev.end - size, 0);
                        current = to;
                        if (from >= to) {
                            reverse = true;
                        }
                        } else {
                        from = Math.min(prev.start + size, el.textContent?.length || 0);
                        to = prev.end;
                        current = from;
                        if (from >= to) {
                            reverse = true;
                        }
                        }
                        if (reverse) {
                            selectCursorPos(to, from, el);
                            return { start: to, end: from, direction: direction, current: current };
                        } else {
                            selectCursorPos(from, to, el);
                            return { start: from, end: to, direction: prev.direction, current: current };
                        }
                    }
            }
            }
        });
        });
    }
    };

    const handleCompositionStart = (e: CompositionEvent) => {
        e.preventDefault();
        setIsComposing(true);
    };
    
    const handleCompositionEnd = (e: CompositionEvent) => {
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

    const insertText = (text: string) => {
        if (cursorPos() === null) return;
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
            setValidStyles(prev => {
                return { 
                    working: prev.current, 
                    current: prev.current, 
                    isNeedUpdate: false,
                };
            });
            });
            break;
        case "object":
            const rangeSelectionState = rangeSelected();
            break;
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

        switch (e.key) {
        case "Backspace":
            const deleted = deleteText(1, "backward");
            if (!deleted.success || !deleted.deleted) return;
            if (!deleted.rangeDeleted) {
            moveCursorHorizontally(true, deleted.deleted, "backward");
            return;
            }
            moveCursorHorizontally(true, deleted.deleted, "backward");
            // if (deleted.range?.isLast || false) {
            //   setCursorPos(prev => {
            //     if (prev === null) return null;
            //     switch (typeof prev) {
            //       case "number":
            //         return prev;
            //       case "object":
            //         return prev.start;
            //     }
            //   });
            // } else {
            //   moveCursorHorizontally(true, deleted.deleted, "backward");
            // }
            return;
        case "Enter":
            insertText("\n");
            moveCursorHorizontally(true, 1, "forward");
            return;
        case "Tab":
            insertText("\t");
            moveCursorHorizontally(true, 1, "forward");
            return;
        default:
            if (e.key.length === 1) {
            const ctrKey = e.ctrlKey
            const metaKey = e.metaKey;
            const altKey = e.altKey;
            const shiftKey = e.shiftKey;
            insertText(e.key);
            moveCursorHorizontally(true, 1, "forward");
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
    el.addEventListener("focus", (e) => {
        e.preventDefault();
        batch(() => {
            if (cursorPos() === null) {
                handleCursorPos();
            }
        });
    });
    
    createEffect(() => {
        caretColor() !== null ?
            el.style.setProperty("caret-color", caretColor())
            : el.style.removeProperty("caret-color");
    });

    const handleSelectionChange = () => {
        if (!el) return;
        if (document.activeElement !== el) return;
        if (editableTextRef()?.id === value().textZoneId()) {
            saveCursorPosition();
        }
    };

    createEffect(() => {
        const newTextRef = editableTextRef();
        if (newTextRef === null) return;
        if (newTextRef.id === value().textZoneId() && newTextRef.newSelected) {
            batch(() => {
                saveCursorPosition();
                setEditableTextRef({
                    ...newTextRef,
                    newSelected: false,
                });
                handleCursorPos();
            });
        }
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