import { batch, createEffect, createSignal } from "solid-js";
import { 
    currentStyle, 
    editableTextCursor, 
    editableTextRef, 
    setCurrentStyle, 
    setRangeFontBoldStyleUpdate, 
    setRangeFontColorStyleUpdate, 
    setRangeFontFamilyStyleUpdate, 
    setRangeFontItalicStyleUpdate, 
    setRangeFontSizeStyleUpdate, 
    setRangeFontStrikeThroughStyleUpdate, 
    setRangeFontUnderlineStyleUpdate, 
    setRangeHighlightColorStyleUpdate 
} from "../store";
import { selectCursorPos } from "../utils";

export function useSetStyle() {
    const [localStyle, setLocalStyle] = createSignal(currentStyle().style);

    createEffect(() => {
        const newStyle = currentStyle()
        switch (newStyle.from) {
            case "setter":
                // no need to update the style
            case "none":
                setLocalStyle(newStyle.style);
                break;
            default:
                setLocalStyle(newStyle.style);
                break;
        }
    });

    const setCursorForStyle = () => {
        if (editableTextRef()) {
            const textRef = editableTextRef()!;
            textRef.elm.focus();
            const cursor = editableTextCursor();
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
            selectCursorPos(from, to, textRef.elm);
        }
    }
    
    const setFontFamily = (fontFamily: string) => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.fontFamily === fontFamily) {
                    return prev;
                }
                return {
                    style: {
                        ...prev.style,
                        fontFamily: fontFamily,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeFontFamilyStyleUpdate({ 
                    id: editableTextRef()!.id,
                    fontFamily 
                });
            }
            setLocalStyle(prev => {
                if (prev.fontFamily === fontFamily) {
                    return prev;
                }
                return {
                    ...prev,
                    fontFamily: fontFamily,
                };
            });
            setCursorForStyle()
        });
    };

    const setFontSize = (size: number) => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.fontSize === size) {
                    return prev;
                }
                return {
                    style: {
                        ...prev.style,
                        fontSize: size,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeFontSizeStyleUpdate({
                    id: editableTextRef()!.id,
                    type: "specific",
                    size 
                });
            }
            setLocalStyle(prev => {
                if (prev.fontSize === size) {
                    return prev;
                }
                return {
                    ...prev,
                    fontSize: size,
                };
            });
            setCursorForStyle()
        });
    };

    const updateFontSize = (size: number, validator?: (size: number) => number|null) => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.fontSize === undefined) {
                    return prev;
                }
                const afterSize = prev.style.fontSize + size;
                const newSize = validator ? validator(afterSize) : afterSize;
                if (newSize === null) {
                    return prev;
                }
                return {
                    style: {
                        ...prev.style,
                        fontSize: newSize,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeFontSizeStyleUpdate({
                    id: editableTextRef()!.id,
                    type: "update",
                    size: size,
                });
            }
            setLocalStyle(prev => {
                if (prev.fontSize === undefined) {
                    return prev;
                }
                const newFontSize = prev.fontSize + size;
                const newSize = validator ? validator(newFontSize) : newFontSize;
                if (newSize === null) {
                    return prev;
                }
                return {
                    ...prev,
                    fontSize: newSize,
                };
            });
            setCursorForStyle()
        });
    };

    const setBold = (bold: boolean) => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.bold === bold) {
                    return prev;
                }
                return {
                    style: {
                        ...prev.style,
                        bold: bold,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeFontBoldStyleUpdate({
                    id: editableTextRef()!.id,
                    type: "specific",
                    bold,
                });
            }
            setLocalStyle(prev => {
                if (prev.bold === bold) {
                    return prev;
                }
                return {
                    ...prev,
                    bold: bold,
                };
            });
            setCursorForStyle()
        });
    };

    const switchBold = () => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.bold === undefined) {
                    return prev;
                }
                return {
                    style: {
                        ...prev.style,
                        bold: !prev.style.bold,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeFontBoldStyleUpdate({
                    id: editableTextRef()!.id,
                    type: "switch",
                });
            }
            setLocalStyle(prev => {
                if (prev.bold === undefined) {
                    return prev;
                }
                return {
                    ...prev,
                    bold: !prev.bold,
                };
            });
            setCursorForStyle()
        });
    };

    const setItalic = (italic: boolean) => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.italic === italic) {
                    return prev;
                }
                return {
                    style: {
                        ...prev.style,
                        italic: italic,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeFontItalicStyleUpdate({
                    id: editableTextRef()!.id,
                    type: "specific",
                    italic,
                });
            }
            setLocalStyle(prev => {
                if (prev.italic === italic) {
                    return prev;
                }
                return {
                    ...prev,
                    italic: italic,
                };
            });
            setCursorForStyle()
        });
    };

    const switchItalic = () => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.italic === undefined) {
                    return prev;
                }
                return {
                    style: {
                        ...prev.style,
                        italic: !prev.style.italic,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeFontItalicStyleUpdate({
                    id: editableTextRef()!.id,
                    type: "switch",
                });
            }
            setLocalStyle(prev => {
                if (prev.italic === undefined) {
                    return prev;
                }
                return {
                    ...prev,
                    italic: !prev.italic,
                };
            });
            setCursorForStyle()
        });
    };

    const setUnderline = (underline: boolean) => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.underline === underline) {
                    return prev;
                }
                return {
                    style: {
                        ...prev.style,
                        underline: underline,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeFontUnderlineStyleUpdate({
                    id: editableTextRef()!.id,
                    type: "specific",
                    underline,
                });
            }
            setLocalStyle(prev => {
                if (prev.underline === underline) {
                    return prev;
                }
                return {
                    ...prev,
                    underline: underline,
                };
            });
            setCursorForStyle()
        });
    }

    const switchUnderline = () => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.underline === undefined) {
                    return prev;
                }
                return {
                    style: {
                        ...prev.style,
                        underline: !prev.style.underline,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeFontUnderlineStyleUpdate({
                    id: editableTextRef()!.id,
                    type: "switch",
                });
            }
            setLocalStyle(prev => {
                if (prev.underline === undefined) {
                    return prev;
                }
                return {
                    ...prev,
                    underline: !prev.underline,
                };
            });
            setCursorForStyle()
        });
    };

    const setStrikeThrough = (strikeThrough: boolean) => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.strikeThrough === strikeThrough) {
                    return prev;
                }
                return {
                    style: {
                        ...prev.style,
                        strikeThrough: strikeThrough,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeFontStrikeThroughStyleUpdate({
                    id: editableTextRef()!.id,
                    type: "specific",
                    strikeThrough,
                });
            }
            setLocalStyle(prev => {
                if (prev.strikeThrough === strikeThrough) {
                    return prev;
                }
                return {
                    ...prev,
                    strikeThrough: strikeThrough,
                };
            });
            setCursorForStyle()
        });
    }

    const switchStrikeThrough = () => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.strikeThrough === undefined) {
                    return prev;
                }
                return {
                    style: {
                        ...prev.style,
                        strikeThrough: !prev.style.strikeThrough,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeFontStrikeThroughStyleUpdate({
                    id: editableTextRef()!.id,
                    type: "switch",
                });
            }
            setLocalStyle(prev => {
                if (prev.strikeThrough === undefined) {
                    return prev;
                }
                return {
                    ...prev,
                    strikeThrough: !prev.strikeThrough,
                };
            });
            setCursorForStyle()
        });
    };

    const setHighlightColor = (color: string) => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.highlightColor === color) {
                    return prev;
                }
                return {
                    style: {
                        ...prev.style,
                        highlightColor: color,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeHighlightColorStyleUpdate({
                    id: editableTextRef()!.id,
                    color,
                });
            }
            setLocalStyle(prev => {
                if (prev.highlightColor === color) {
                    return prev;
                }
                return {
                    ...prev,
                    highlightColor: color,
                };
            });
            setCursorForStyle()
        });
    };

    const setFontColor = (color: string) => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.fontColor === color) {
                    return prev;
                }
                return {
                    style: {
                        ...prev.style,
                        fontColor: color,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeFontColorStyleUpdate({
                    id: editableTextRef()!.id,
                    color,
                });
            } else {
                setCursorForStyle()
            }
            setLocalStyle(prev => {
                if (prev.fontColor === color) {
                    return prev;
                }
                return {
                    ...prev,
                    fontColor: color,
                };
            });
        });
    };

    return {
        localStyle,
        setCursorForStyle,
        setFontFamily,
        setFontSize,
        updateFontSize,
        setBold,
        switchBold,
        setItalic,
        switchItalic,
        setUnderline,
        switchUnderline,
        setStrikeThrough,
        switchStrikeThrough,
        setHighlightColor,
        setFontColor,
    };
}