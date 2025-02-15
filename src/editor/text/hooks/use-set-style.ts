import { batch, createEffect, createSignal } from "solid-js";
import { 
    currentStyle, 
    editableTextRef, 
    setCurrentStyle, 
    setRangeFontBoldStyleUpdate, 
    setRangeFontColorStyleUpdate, 
    setRangeFontFamilyStyleUpdate, 
    setRangeFontItalicStyleUpdate, 
    setRangeFontSizeStyleUpdate, 
    setRangeFontStrikeThroughStyleUpdate, 
    setRangeFontUnderlineStyleUpdate, 
    setRangeFontVerticalAlignStyleUpdate, 
    setRangeHighlightColorStyleUpdate 
} from "../store";

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
                    type: "toggle",
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
        });
    };

    const nearTrueBold = () => {
        batch(() => {
            let forRange = false, allTrue = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.bold === undefined) {
                    return prev;
                }
                if (prev.style.bold) {
                    allTrue = true;
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
                    type: "nearTrue",
                    allTrue,
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
                    type: "toggle",
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
        });
    };

    const nearTrueItalic = () => {
        batch(() => {
            let forRange = false, allTrue = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.italic === undefined) {
                    return prev;
                }
                if (prev.style.italic) {
                    allTrue = true;
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
                    type: "nearTrue",
                    allTrue,
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
                    type: "toggle",
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
        });
    };

    const nearTrueUnderline = () => {
        batch(() => {
            let forRange = false, allTrue = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.underline === undefined) {
                    return prev;
                }
                if (prev.style.underline) {
                    allTrue = true;
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
                    type: "nearTrue",
                    allTrue,
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
                    type: "toggle",
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
        });
    };

    const nearTrueStrikeThrough = () => {
        batch(() => {
            let forRange = false, allTrue = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                if (prev.style.strikeThrough === undefined) {
                    return prev;
                }
                if (prev.style.strikeThrough) {
                    allTrue = true;
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
                    type: "nearTrue",
                    allTrue,
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

    const setVerticalAlign = (verticalAlign: string) => {
        batch(() => {
            let forRange = false;
            setCurrentStyle(prev => {
                if (prev.selectType === "range") {
                    forRange = true;
                }
                return {
                    style: {
                        ...prev.style,
                        verticalAlign: verticalAlign,
                    },
                    selectType: prev.selectType,
                    from: "setter",
                }
            });
            if (forRange && editableTextRef() !== null) {
                setRangeFontVerticalAlignStyleUpdate({
                    id: editableTextRef()!.id,
                    verticalAlign,
                });
            }
            setLocalStyle(prev => {
                if (prev.verticalAlign === verticalAlign) {
                    return prev;
                }
                return {
                    ...prev,
                    verticalAlign: verticalAlign,
                };
            });
        });
    };

    return {
        localStyle,
        setFontFamily,
        setFontSize,
        updateFontSize,
        setBold,
        switchBold,
        nearTrueBold,
        setItalic,
        switchItalic,
        nearTrueItalic,
        setUnderline,
        switchUnderline,
        nearTrueUnderline,
        setStrikeThrough,
        switchStrikeThrough,
        nearTrueStrikeThrough,
        setHighlightColor,
        setFontColor,
        setVerticalAlign,
    };
}