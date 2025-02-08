import { batch } from "solid-js";
import { editableTextCursor, editableTextRef, setEditableActionIgnore } from "../store/action";

export const setStyle = (styleChange: () => void) => {
    batch(() => {
        styleChange();
        setEditableActionIgnore(true);
    });
    if (editableTextRef()) {
        const cursor = editableTextCursor()
        if (cursor === null) return;
        let from: number, to: number;
        switch (typeof cursor) {
            case "number":
                from = cursor;
                to = cursor;
                break;
            case "object":
                from = cursor.start;
                to = cursor.end;
                break;
            default:
                return;
        }
        const selection = window.getSelection();
        const range = document.createRange();
        let charIndex = 0;
        let startNode: Node | null = null;
        let startOffset = 0;
        let endNode: Node | null = null;
        let endOffset = 0;
        const traverseNodes = (node: Node): boolean => {
            if (node.nodeType === Node.TEXT_NODE) {
                const textLength = node.textContent!.length;
                const nextCharIndex = charIndex + textLength;
                if (!startNode && from >= charIndex && from <= nextCharIndex) {
                    startNode = node;
                    startOffset = from - charIndex;
                }
                if (!endNode && to >= charIndex && to <= nextCharIndex) {
                    endNode = node;
                    endOffset = to - charIndex;
                    if (endOffset === textLength) {
                        endOffset = textLength;
                    }
                }
                charIndex = nextCharIndex;
            } else {
                for (const child of Array.from(node.childNodes)) {
                    if (traverseNodes(child)) return true;
                }
            }
            return false;
        };
        const textRef = editableTextRef()!;
        textRef.focus();
        traverseNodes(textRef);
        if (from === to) {
            if (startNode) {
                range.setStart(startNode, startOffset);
                range.collapse(true);
                selection?.removeAllRanges();
                selection?.addRange(range);
            } else {
                range.setStart(textRef, 0);
                range.collapse(true);
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
        } else if (startNode && endNode) {
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }
}