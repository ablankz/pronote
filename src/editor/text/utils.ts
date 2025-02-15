export const selectCursorPos = (
    from: number, 
    to: number,
    textRef: HTMLElement,
    noRemove: boolean = false
) => {
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

    traverseNodes(textRef);

    if (from === to) {
        if (startNode) {
            range.setStart(startNode, startOffset);
            range.collapse(true);
            noRemove || selection?.removeAllRanges();
            selection?.addRange(range);
        }
    } else if (startNode && endNode) {
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        noRemove || selection?.removeAllRanges();
        selection?.addRange(range);
    }
};