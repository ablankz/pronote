import { batch, Component, createEffect, createSignal, Index } from "solid-js";
import { DefaultFlexibleText, FlexibleText } from "../../types/text";

interface FlexibleTextRendererProps {
    class?: string;
    classList?: Record<string, boolean>;
    defaultBlock: FlexibleText[];
    onUpdate: (block: FlexibleText[]) => void;
    editable?: boolean;
}

const FlexibleTextRenderer : Component<FlexibleTextRendererProps> = (props) => {
    let textRef: HTMLDivElement | undefined;
    const [textBlock, setTextBlock] = createSignal(props.defaultBlock);
    const [editingText, setEditingText] = createSignal<string>("");
    const [isEditing, setIsEditing] = createSignal(false);
    const [cursorPos, setCursorPos] = createSignal<number | null>(null);

    const saveCursorPosition = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(textRef!);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      setCursorPos(preCaretRange.toString().length);
    };

    const restoreCursorPosition = () => {
      if (cursorPos() === null || !textRef) return;
      const selection = window.getSelection();
      const range = document.createRange();
      let charIndex = 0;

      const traverseNodes = (node: Node): boolean => {
        if (node.nodeType === Node.TEXT_NODE) {
          const nextCharIndex = charIndex + node.textContent!.length;
          if (charIndex <= cursorPos()! && cursorPos()! <= nextCharIndex) {
            range.setStart(node, cursorPos()! - charIndex);
            range.setEnd(node, cursorPos()! - charIndex);
            return true;
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
      selection?.removeAllRanges();
      selection?.addRange(range);
    };

    createEffect(() => {
      setTextBlock(prev => {
        const lastBlock = prev[prev.length - 1];
        if (editingText().length === 0) {
          prev = prev.slice(0, -1);
          const pprev = prev[prev.length - 1];
          if (pprev) {
            batch(() => {
              setEditingText(pprev.text);
              // TODO: current styleの変更
            });
          }else {
            batch(() => {
              setEditingText("");
              // TODO: default styleの適応
            });
          }
        }else {
          prev = prev.slice(0, -1).concat([{ ...lastBlock, text: editingText() }]);
        }
        return prev;
      });
    });

    console.log("textBlock", textBlock());

    const saveStyledText = (e: KeyboardEvent) => {
      e.preventDefault();

      saveCursorPosition();

      switch (e.key) {
        case "Backspace":
          setEditingText(prev => prev.length > 0 ? prev.slice(0, -1) : prev);
          break;
        case "Enter":
          setEditingText(prev => prev + "\n");
          break;
        case "Tab":
          setEditingText(prev => prev + "  ");
          break;
        default:
          if (e.key.length === 1) {
            setEditingText(prev => prev + e.key);
          }
          break;
      }

      console.log("editingText", editingText());
      console.log("block", textBlock());

      // if (!textRef) return;

      // let content: FlexibleText[] = [];
      // const nodes = textRef.childNodes;

      // nodes.forEach((node) => {
      //   if (node.nodeType === Node.TEXT_NODE) {
      //     content.push({ 
      //       text: node.textContent || DefaultFlexibleText.text,
      //       bold: DefaultFlexibleText.bold,
      //       italic: DefaultFlexibleText.italic,
      //       underline: DefaultFlexibleText.underline,
      //       strikeThrough: DefaultFlexibleText.strikeThrough,
      //       color: DefaultFlexibleText.color,
      //       fontSize: DefaultFlexibleText.fontSize,
      //       fontFamily: DefaultFlexibleText.fontFamily,
      //     });
      //   } else if (node.nodeType === Node.ELEMENT_NODE) {
      //     const element = node as HTMLElement;
      //     content.push({
      //       text: element.textContent || DefaultFlexibleText.text,
      //       bold: element.style.fontWeight === "bold",
      //       italic: element.style.fontStyle === "italic",
      //       underline: element.style.textDecoration.includes("underline"),
      //       strikeThrough: element.style.textDecoration.includes("line-through"),
      //       color: element.style.color || DefaultFlexibleText.color,
      //       fontSize: parseInt(element.style.fontSize) || DefaultFlexibleText.fontSize,
      //       fontFamily: element.style.fontFamily || DefaultFlexibleText.fontFamily,
      //     });
      //   }
      // });

      // props.onUpdate({ text: content });

      setTimeout(restoreCursorPosition, 0);
    };

    return (
        <div
            class={`${props.class || ""}`}
            classList={{
                "bg-white": isEditing(),
                ...(props.classList || {}),
            }}
            ref={textRef}
            onKeyDown={(e: KeyboardEvent) => saveStyledText(e)}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            contenteditable={props.editable}
            >
              <Index each={textBlock()}>
                {(chunk) => {
                  return (
                    <span 
                      style={{
                        "font-weight": chunk().bold ? "bold" : "normal",
                        "font-style": chunk().italic ? "italic" : "normal",
                        "text-decoration": `${chunk().underline ? "underline" : ""} ${chunk().strikeThrough ? "line-through" : ""}`,
                        "color": chunk().color || "inherit",
                        "font-size": `${chunk().fontSize}px`,
                        "font-family": chunk().fontFamily || "inherit",
                      }}
                      >
                      {chunk().text}
                    </span>
                  );
                }}
              </Index>
        </div>
    );
  };
  
  export default FlexibleTextRenderer;