import { batch, Component, createEffect, createMemo, createSignal, For, Match, onCleanup, onMount, Switch, untrack } from "solid-js";
import { DefaultFlexibleText, DefaultFlexibleTextStyles, equalFlexibleTextStyles, extractStyleFromFlexibleText, FlexibleText, FlexibleTextStyles, FlexibleTextTypes } from "../../types/text";
import { RangeWithCurrent } from "../../types/generic";
import { currentStyle, setCurrentStyle, setEditableActionIgnore, setEditableTextCursor, setEditableTextRef } from "../../store/action";

// TODO: 改行でのカーソル移動
// TODO: 範囲選択後のキー入力
// TODO: 単一カーソルでのスタイル変更
// TODO: 範囲選択でのスタイル変更

interface FlexibleTextRendererProps {
    class?: string;
    classList?: Record<string, boolean>;
    defaultBlock: FlexibleText[];
    onUpdate: (block: FlexibleText[]) => void;
    editable?: boolean;
    letterSpacing?: number;
    lineHeight?: number;
    padding?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
}

const FlexibleTextRenderer : Component<FlexibleTextRendererProps> = (props) => {
    let textRef: HTMLDivElement | undefined;
    const [textBlock, setTextBlock] = createSignal<FlexibleText[]>([
      ...props.defaultBlock,
    ]);
    const [editingTextCursor, setEditingTextCursor] = createSignal<number>(0);
    const [editingTextBlock, setEditingTextBlock] = createSignal<number>(props.defaultBlock.length);
    const [isEditing, setIsEditing] = createSignal(false);
    const [arrowSelection, setArrowSelection] = createSignal(false);
    const [cursorPos, setCursorPos] = createSignal<number | RangeWithCurrent | null>(null);
    const [isComposing, setIsComposing] = createSignal(false);
    const [validStyles, setValidStyles] = createSignal<{
      working: FlexibleTextStyles,
      current: FlexibleTextStyles,
      isNeedUpdate: boolean,
    }>({working: DefaultFlexibleTextStyles, current: DefaultFlexibleTextStyles, isNeedUpdate: false });
    const [caretColor, setCaretColor] = createSignal<string | null>(null);

    createEffect(() => {
      const newStyle = currentStyle()
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
      preCaretRangeRight.selectNodeContents(textRef!);
      preCaretRangeRight.setEnd(range.endContainer, range.endOffset);
      const rightIndex = preCaretRangeRight.toString().length;

      const preCaretRangeLeft = range.cloneRange();
      preCaretRangeLeft.selectNodeContents(textRef!);
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
                  return { start: rightIndex, end: leftIndex, direction: direction, current: rightIndex };
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
                      from = Math.min(prev.start + size, textRef?.textContent?.length || 0);
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
        switch (typeof cursorPos()) {
          case "number":
            const cursorOffset: number = Number(cursorPos());
            let editingBlock = -1, textIndex = -1;
            const blocks = untrack(textBlock);
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
            let editBlockStyle: FlexibleTextStyles = DefaultFlexibleTextStyles;
            if (editingBlock >= 0) {
              const editBlock = blocks[editingBlock];
              editBlockStyle = {
                ...extractStyleFromFlexibleText(editBlock),
              }
            }
            batch(() => {
              setEditableTextCursor(cursorPos());
              textRef && setEditableTextRef(textRef);
              setEditingTextBlock(editingBlock);
              setEditingTextCursor(textIndex);
              let ignore = false;
              setEditableActionIgnore(prev => {
                if (prev) {
                  ignore = true;
                }
                return false;
              });
              if (ignore) {
                return;
              }
              let isNeedUpdate = false;
              setValidStyles(prev => {
                if (prev.current === null) return prev;
                if (!equalFlexibleTextStyles(prev.current, editBlockStyle)) {
                  isNeedUpdate = true;
                  return { working: editBlockStyle, current: editBlockStyle, isNeedUpdate: true };
                }
                return prev;
              });
              isNeedUpdate && setCurrentStyle(editBlockStyle);
            });
            break;
          case "object":
            break;
        }
      }
    }

    createEffect(() => {
      handleCursorPos();
    });

    const moveCursorHorizontally = (collapsing: boolean, size: number, direction: "forward" | "backward") => {
      if (!textRef) return;

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
                    prev + size, textRef.textContent?.length || 0
                  ) : Math.max(prev - size, 0);
                  selectCursorPos(offset, offset);
                  return offset;
                case "object":
                  if (direction === "forward") {
                    offset = prev.end;
                  } else {
                    offset = prev.start;
                  }
                  selectCursorPos(offset, offset);
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
                    to = Math.min(prev + size, textRef.textContent?.length || 0);
                    current = to;
                  } else {
                    from = Math.max(prev - size, 0);
                    to = prev;
                    current = from;
                  }
                  selectCursorPos(from, to);
                  return { start: from, end: to, direction: direction, current: current };
                case "object":
                  if (direction === prev.direction) {
                    let from: number, to: number, current: number;
                    if (direction === "forward") {
                      from = prev.start;
                      to = Math.min(prev.end + size, textRef.textContent?.length || 0);
                      current = to;
                    } else {
                      from = Math.max(prev.start - size, 0);
                      to = prev.end;
                      current = from;
                    }
                    selectCursorPos(from, to);
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
                      from = Math.min(prev.start + size, textRef.textContent?.length || 0);
                      to = prev.end;
                      current = from;
                      if (from >= to) {
                        reverse = true;
                      }
                    }
                    if (reverse) {
                      selectCursorPos(to, from);
                      return { start: to, end: from, direction: direction, current: current };
                    } else {
                      selectCursorPos(from, to);
                      return { start: from, end: to, direction: prev.direction, current: current };
                    }
                  }
              }
            }
          });
        });
      }
    };

    const selectCursorPos = (from: number, to: number) => {
      if (!textRef) return;
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
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      } else if (startNode && endNode) {
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    };

    const handleSelectionChange = () => {
      if (!textRef) return;
      if (document.activeElement === textRef) {
        saveCursorPosition();
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

    onMount(() => {
      document.addEventListener("selectionchange", handleSelectionChange);
      document.addEventListener("compositionstart", handleCompositionStart);
      document.addEventListener("compositionend", handleCompositionEnd);
    });

    onCleanup(() => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("compositionstart", handleCompositionStart);
      document.removeEventListener("compositionend", handleCompositionEnd);
    });

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
                    ...DefaultFlexibleText(crypto.randomUUID()),
                    ...validStyles().current,
                    text: text,
                  },
                  ...prev
                ]
              }

              if (validStyles().isNeedUpdate) {
                const newBlock: FlexibleText = {
                  ...DefaultFlexibleText(crypto.randomUUID()),
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
                      id: crypto.randomUUID(),
                      text: firstText,
                      version: 0,
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
                      id: crypto.randomUUID(),
                      text: firstText,
                      version: 0,
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
                      id: crypto.randomUUID(),
                      version: 0,
                    },
                    newBlock,
                    {
                      ...editingBlock,
                      text: secondText,
                      id: crypto.randomUUID(),
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
          console.log(textBlock());
          break;
        case "object":
          break;
      }
    };

    // createEffect(() => {
    //   console.log(textBlock());
    // });

    const deleteText = (size: number, direction: "forward" | "backward") => {
      if (cursorPos() === null) return;
      switch (typeof cursorPos()) {
        case "number":
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
            // const isLastBlock = editingTextBlockIndex === prev.length - 1;

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
          break;
        case "object":
          break;
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
          deleteText(1, "backward");
          moveCursorHorizontally(true, 1, "backward");
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

    const keys = createMemo(() => textBlock().map((el, i) => el.id + "[" + el.version + "]" + ":" + i));

    const map = createMemo(() => {
        const map = new Map<string, FlexibleText>();
        textBlock().forEach((item, i) => map.set(item.id + "[" + item.version + "]" + ":" + i, item));
        return map;
    });
    
    return (
        <div
            class={`${props.class || ""}`}
            classList={{
                ...(props.classList || {}),
            }}
            style={{
                "min-height": "1em",
                "margin": "0",
                "padding": `${props.padding?.top || 0}px ${props.padding?.right || 0}px ${props.padding?.bottom || 0}px ${props.padding?.left || 0}px`,
                "line-height": `${props.lineHeight || 1.5}`,
                "letter-spacing": `${props.letterSpacing || 0}px`,
            }}
            ref={textRef}
            onKeyDown={(e: KeyboardEvent) => saveStyledText(e)}
            onInput={(e: InputEvent) => {
              e.preventDefault();
            }}
            onFocus={() => {
              batch(() => {
                setIsEditing(true);
                handleCursorPos();
              });
            }}
            onBlur={() => {
              batch(() => {
                setIsEditing(false);
              });
            }}
            contenteditable={props.editable}
            >
              <For each={keys()}>
                {(key) => {
                  const chunk = map().get(key)!;
                  return (
                    <Switch>
                      <Match when={chunk.type === FlexibleTextTypes.TEXT}>
                        <span 
                          style={{
                            "font-weight": chunk.bold ? "bold" : "normal",
                            "font-style": chunk.italic ? "italic" : "normal",
                            "text-decoration": `${chunk.underline ? "underline" : ""} ${chunk.strikeThrough ? "line-through" : ""}`,
                            "color": chunk.fontColor || "inherit",
                            "caret-color": caretColor() || chunk.fontColor || "inherit",
                            "background-color": chunk.highlightColor || "inherit",
                            "font-size": `${chunk.fontSize}px`,
                            "font-family": chunk.fontFamily || "inherit",
                          }}
                          >
                          {chunk.text}
                        </span>
                      </Match>
                    </Switch>
                    
                  );
                }}
              </For>
        </div>
    );
  };
  
  export default FlexibleTextRenderer;