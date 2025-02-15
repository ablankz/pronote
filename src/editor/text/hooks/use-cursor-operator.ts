import { Accessor, batch, createEffect, createSignal, Setter, Signal, untrack } from "solid-js";
import { RangeWithCurrent } from "../../../types/generic";
import { selectCursorPos } from "../utils";
import { RangeSelectedState } from "../type";
import { FlexibleText, FlexibleTextStyles, NullableFlexibleTextStyles } from "../../../renderer/text/types";
import { DefaultFlexibleTextStyles } from "../../../renderer/text/const";
import { equalOverrideFlexibleTextStyles, extractStyleFromFlexibleText } from "../../../renderer/text/utils";
import { editableTextRef, setCurrentStyle, setEditableTextRef } from "../store";

export function useCursorOperator(
    el: HTMLElement,
    textZoneId: Accessor<string>,
    ignoreSelect: Accessor<boolean>,
    setBlockStyle: (editBlockStyle: FlexibleTextStyles) => boolean,
    setCaretColor: Setter<string|null>,
    textBlock: Accessor<FlexibleText[]>,
    cursorPosSig: Signal<number | RangeWithCurrent | null>,
    setRangeSelected: Setter<RangeSelectedState | null>,
    batchSelectCursorPosSig: Signal<{
        from: number,
        to: number,
    } | null>,
) {
    const [arrowSelection, setArrowSelection] = createSignal(false);
    const [cursorPos, setCursorPos] = cursorPosSig;
    const [editingTextCursor, setEditingTextCursor] = createSignal<number>(0);
    const [editingTextBlock, setEditingTextBlock] = createSignal<number>(0);
    const [batchSelectCursorPos, setBatchSelectCursorPos] = batchSelectCursorPosSig;

    createEffect(() => {
        if (batchSelectCursorPos() !== null) {
            batch(() => {
                selectCursorPos(batchSelectCursorPos()!.from, batchSelectCursorPos()!.to, el);
                setBatchSelectCursorPos(null);
            });
        }
    });

    const saveCursorPosition = () => {
        if (ignoreSelect()) return;
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
        if (ignoreSelect() || cursorPos() === null) {
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
                        const isNeedUpdate = setBlockStyle(editBlockStyle);
                        isNeedUpdate && setCurrentStyle({
                            style: editBlockStyle,
                            selectType: "cursor",
                            from: textZoneId(),
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
                            from: textZoneId(),
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
                                    offset = prev.end + size;
                                } else {
                                    offset = prev.start - size;
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

    el.addEventListener("focus", (e) => {
        e.preventDefault();
        batch(() => {
            if (cursorPos() === null) {
                handleCursorPos();
            }
        });
    });

    const handleSelectionChange = () => {
        if (!el) return;
        if (document.activeElement !== el) return;
        if (editableTextRef()?.id === textZoneId()) {
            saveCursorPosition();
        }
    };

    createEffect(() => {
        const newTextRef = editableTextRef();
        if (newTextRef === null) return;
        if (newTextRef.id === textZoneId() && newTextRef.newSelected) {
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

    return {
        handleSelectionChange,
        moveCursorHorizontally,
        editingTextCursor,
        setEditingTextCursor,
        editingTextBlock,
        setEditingTextBlock,
    };
}