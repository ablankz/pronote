import { 
    createSignal, 
    createEffect, 
    onMount, 
    createMemo, 
    Switch, 
    Match, 
    batch,
    Component,
    onCleanup,
} from "solid-js";
import { 
    Color, 
    colorToHSL, 
    colorToString, 
    DefaultHSLColor, 
    hexToHsl, 
    HSLColor, 
    hslToHex, 
    hslToRgb, 
    resolveColor,
    RGBColor,
    rgbToHsl,
} from "./utils";
import { ChevronsUpDown } from "lucide-solid";
import { fixFloatingPoint } from "../../utils/calc";
import { ColorPickerApplyButtonProps, DefaultColorPickerApplyButton } from "./component/apply-button";
import { CanvasAttr, CanvasPos, ColorCanvas } from "./component/canvas";
import { 
    alphaFixedPrecision, 
    displayAlphaPrecision, 
    displayHuePrecision, 
    displayLightnessPrecision, 
    displayRGBPrecision, 
    displaySaturationPrecision, 
    hslLightnessFixedPrecision, 
    hslSaturationFixedPrecision 
} from "./const";

interface ColorPickerProps {
    class?: string;
    classList?: Record<string, boolean>;
    defaultColor?: Color;
    colorStrFormat?: "hex" | "rgb" | "hsl";
    defaultDisplayStyle?: "hex" | "rgb" | "hsl";
    handleClose: () => void;
    isOpen: boolean;
    onClose?: (closeType: "apply" | "cancel") => void;
    color: string;
    setColor: (color: string) => void;
    closeIgnoreRef?: HTMLDivElement;
    setParentIgnoreOutsideClick?: (value: boolean) => void;
    ignoreClick?: boolean;
    customApplyButton?: Component<ColorPickerApplyButtonProps>;
    escapeCustomHandler?: () => void;
    precisions?: {
        alpha?: number;
        rgb?: number;
        hue?: number;
        saturation?: number;
        lightness?: number;
        displayAlpha?: number;
        displayRGB?: number;
        displayHue?: number;
        displaySaturation?: number;
        displayLightness?: number;
    };
}

const hexValidChars = "0123456789abcdefABCDEF";
const rgbValidChars = "0123456789";
const hueValidChars = "0123456789";
const saturationValidChars = "0123456789";
const lightnessValidChars = "0123456789";

const ColorPicker = (props: ColorPickerProps) => {
    const [selectedColor, setSelectedColor] = createSignal<HSLColor>(
        props.defaultColor ? colorToHSL(props.defaultColor) : DefaultHSLColor
    );
    const [selectedColorFrom, setSelectedColorFrom] = createSignal<"init" | "canvas" | "input" | "prop">("init");
    const [displayStyle, setDisplayStyle] = createSignal<"hex" | "rgb" | "hsl">(props.defaultDisplayStyle || "rgb");
    const [recalcHCanvas, setRecalcHCanvas] = createSignal(false);
    const [recalcSLCanvas, setRecalcSLCanvas] = createSignal(false);
    const [recalcACanvas, setRecalcACanvas] = createSignal(false);
    const [hexStr, setHexStr] = createSignal("");
    const [_HexBatch, setHexBatch] = createSignal(false);
    const [rgbStr, setRgbStr] = createSignal<{ r: string, g: string, b: string } | null>(null);
    const [rgbColor, setRgbColor] = createSignal<RGBColor | null>(null);
    const [_RGBBatch, setRGBBatch] = createSignal(false);
    const [hslStr, setHslStr] = createSignal<{ h: string, s: string, l: string } | null>(null);
    const [_HSLBatch, setHSLBatch] = createSignal(false);
    const [alphaStr, setAlphaStr] = createSignal("");
    const [_AlphaBatch, setAlphaBatch] = createSignal(false);

    createEffect(() => {
        if (props.isOpen) {
            setRecalcHCanvas(true);
            setRecalcSLCanvas(true);
            setRecalcACanvas(true);
        }
    });

    // Reflect the color prop to the selected color
    createEffect(() => {
        if (!props.color) {
            batch(() => {
                setSelectedColor(
                    props.defaultColor ? colorToHSL(props.defaultColor) : DefaultHSLColor
                );
                setSelectedColorFrom("prop");
            });
            return;
        }
        const color = resolveColor(props.color);
        const hsl = colorToHSL(color);
        batch(() => {
            setSelectedColor(hsl);
            setSelectedColorFrom("prop");
        });
    });

    // Set the color prop for display when the selected color changes
    const colorStr = createMemo(() => {
        if (!selectedColor()) return null;
        return colorToString(selectedColor()!, props.colorStrFormat);
    });

    createEffect(() => {
        if (!selectedColor()) return;
        let batch = false;
        setHexBatch(prev => {
            if (prev) {
                batch = true;
            }
            return false;
        });
        if (batch) return;
        setHexStr(hslToHex(selectedColor()!).replace("#", "").toUpperCase());
    });

    createEffect(() => {
        if (!selectedColor()) return;
        let needBatch = false;
        setAlphaBatch(prev => {
            if (prev) {
                needBatch = true;
            }
            return false;
        });
        if (needBatch) return;
        const alpha = selectedColor()!.a;
        batch(() => {
            setAlphaStr((fixFloatingPoint(alpha, 10 ** displayAlphaPrecision) / 10 ** displayAlphaPrecision).toString());
            setRgbColor(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    a: alpha,
                };
            });
        });
    });

    createEffect(() => {
        if (!selectedColor()) return;
        let needBatch = false;
        setRGBBatch(prev => {
            if (prev) {
                needBatch = true;
            }
            return false;
        });
        if (needBatch) return;
        const rgb = hslToRgb(selectedColor()!);
        batch(() => {
            setRgbStr({
                r: (fixFloatingPoint(rgb.r, 10 ** displayRGBPrecision) / 10 ** displayRGBPrecision).toString(),
                g: (fixFloatingPoint(rgb.g, 10 ** displayRGBPrecision) / 10 ** displayRGBPrecision).toString(),
                b: (fixFloatingPoint(rgb.b, 10 ** displayRGBPrecision) / 10 ** displayRGBPrecision).toString(),
            });
            setRgbColor(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    r: rgb.r,
                    g: rgb.g,
                    b: rgb.b,
                };
            });
        });
    });

    createEffect(() => {
        if (!selectedColor()) return;
        let needBatch = false;
        setHSLBatch(prev => {
            if (prev) {
                needBatch = true;
            }
            return false;
        });
        if (needBatch) return;
        batch(() => {
            setHslStr({
                h: (fixFloatingPoint(selectedColor()!.h, 10 ** displayHuePrecision) / 10 ** displayHuePrecision).toString(),
                s: (fixFloatingPoint(selectedColor()!.s, 10 ** displaySaturationPrecision) / 10 ** displaySaturationPrecision).toString(),
                l: (fixFloatingPoint(selectedColor()!.l, 10 ** displayLightnessPrecision) / 10 ** displayLightnessPrecision).toString(),
            });
        });
    });

    let pickerRef: HTMLDivElement | undefined
    const [ignoreOutsideClick, setIgnoreOutsideClick] = createSignal(false);

    const handleClickOutside = (event: MouseEvent) => {
        if (props.ignoreClick) return;

        if (ignoreOutsideClick()) {
            setIgnoreOutsideClick(false);
            return;
        }

        if (pickerRef && !pickerRef.contains(event.target as Node)) {
            if (!props.closeIgnoreRef || !props.closeIgnoreRef.contains(event.target as Node)) {
                props.handleClose();
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            props.escapeCustomHandler ? 
                props.escapeCustomHandler() :
                props.handleClose();
        }
    };

    onMount(() => {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
    });

    onCleanup(() => {
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
    });

    const slCanvasVerticalGradient = (
        canvas: CanvasGradient,
        _: CanvasPos,
    ) => {
        canvas.addColorStop(0, "rgba(255, 255, 255, 1)");
        canvas.addColorStop(1, "rgba(0, 0, 0, 1)");
    };

    const slCanvasHorizontalGradient = (
        canvas: CanvasGradient,
        _: CanvasPos,
    ) => {
        canvas.addColorStop(0, "rgba(255, 255, 255, 1)");
        canvas.addColorStop(1, `hsl(${selectedColor().h}, 100%, 50%)`);
    }

    const slCanvasOnChange = (
        pos: CanvasPos, 
        from: "internal" | "external"
    ) => {
        if (from === "external") return;
        batch(() => {
            setSelectedColor(prev => {
                if (prev.s === pos.x && prev.l === pos.y) return prev;
                const newHSL = {
                    ...prev,
                    s: pos.x,
                    l: pos.y,
                };
                return newHSL;
            });
            setSelectedColorFrom("canvas");
        });
    };

    const hCanvasHorizontalGradient = (
        canvas: CanvasGradient,
        _: CanvasPos,
    ) => {
        canvas.addColorStop(0, "rgba(255, 0, 0, 1)");
        canvas.addColorStop(0.17, "rgba(255, 255, 0, 1)");
        canvas.addColorStop(0.34, "rgba(0, 255, 0, 1)");
        canvas.addColorStop(0.51, "rgba(0, 255, 255, 1)");
        canvas.addColorStop(0.68, "rgba(0, 0, 255, 1)");
        canvas.addColorStop(0.85, "rgba(255, 0, 255, 1)");
        canvas.addColorStop(1, "rgba(255, 0, 0, 1)");
    };

    const hCanvasOnChange = (
        pos: CanvasPos, 
        from: "internal" | "external"
    ) => {
        if (from === "external") return;
        batch(() => {
            setSelectedColor(prev => {
                if (prev.h === pos.x) return prev;
                const newHSL = {
                    ...prev,
                    h: pos.x,
                };
                return newHSL;
            });
            setSelectedColorFrom("canvas");
        });
    }

    const aCanvasVerticalGradient = (
        canvas: CanvasGradient,
        _: CanvasPos,
    ) => {
        canvas.addColorStop(0, `hsla(${selectedColor().h}, ${selectedColor().s}%, ${selectedColor().l}%, 1)`);
        canvas.addColorStop(1, `hsla(${selectedColor().h}, ${selectedColor().s}%, ${selectedColor().l}%, 0)`);
    };

    const aAdditionalPattern = (
        canvas: CanvasAttr,
        _: CanvasPos,
    ) => {
        const patternSize = 6;
        for (let i = 0; i < canvas.pickerHeight / patternSize; i++) {
            for (let j = 0; j < canvas.pickerWidth / patternSize; j++) {
                if ((i + j) % 2 === 0) {
                    canvas.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
                } else {
                    canvas.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                }
                const x = j * patternSize + canvas.circleRadiusPad;
                const y = i * patternSize + canvas.circleRadiusAddPad;
                const w = Math.min(patternSize, canvas.pickerWidth + canvas.circleRadiusPad - x);
                const h = Math.min(patternSize, canvas.pickerHeight + canvas.circleRadiusAddPad - y);
                canvas.ctx.fillRect(x, y, w, h);
            }
        }
    }

    const aCanvasOnChange = (
        pos: CanvasPos, 
        from: "internal" | "external"
    ) => {
        if (from === "external") return;
        batch(() => {
            setSelectedColor(prev => {
                if (prev.a === pos.y) return prev;
                const newHSL = {
                    ...prev,
                    a: pos.y,
                };
                return newHSL;
            });
            setSelectedColorFrom("canvas");
        });
    }

    const handleHexBeforeInput = (e: InputEvent) => {
        if ((e.target as HTMLInputElement).value.length >= 6
            && e.inputType === "insertText") {
            e.preventDefault();
            return;
        } else if (e.inputType === "insertText" 
            && !hexValidChars.includes((e.data || "").toLowerCase())) {
            e.preventDefault();
            return;
        }
        if (e.inputType === "insertText") {
            e.preventDefault();
            const insertChar = (e.data || "").toUpperCase();
            const insertIndex = (e.target as HTMLInputElement).selectionStart || 0;
            const value = (e.target as HTMLInputElement).value;
            const newValue = value.substring(0, insertIndex) + insertChar + value.substring(insertIndex);
            (e.target as HTMLInputElement).value = newValue;
            (e.target as HTMLInputElement).setSelectionRange(insertIndex + 1, insertIndex + 1);
            handleHexInput(newValue);
            return;
        }
    };

    const handleHexInput = (newValue: string) => {
        batch(() => {
            setHexStr(newValue);
            if (newValue.length === 6) {
                const hsl = hexToHsl("#" + newValue, selectedColor() !== null ? selectedColor()!.a : 1);
                batch(() => {
                    setSelectedColor(hsl);
                    setSelectedColorFrom("input");
                });
                setHexBatch(false);
            }
        });
    };

    const handelHexChange = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        if (value.length !== 6) {
            (e.target as HTMLInputElement).value = hexStr();
        }
    };

    const handelRGBBeforeInput = (e: InputEvent, rgb: "r" | "g" | "b") => {
        if (e.inputType === "insertText" 
            && !rgbValidChars.includes((e.data || "").toLowerCase())) {
            e.preventDefault();
            return;
        }
        if (e.inputType === "insertText") {
            e.preventDefault();
            const insertChar = e.data || "";
            const insertIndex = (e.target as HTMLInputElement).selectionStart || 0;
            const value = (e.target as HTMLInputElement).value;
            const newValue = value.substring(0, insertIndex) + insertChar + value.substring(insertIndex);
            const numValue = parseInt(newValue);
            if (isNaN(numValue) || numValue < 0 || numValue > 255) {
                return;
            }
            (e.target as HTMLInputElement).value = newValue;
            (e.target as HTMLInputElement).setSelectionRange(insertIndex + 1, insertIndex + 1);
            handleRGBInput(newValue, rgb);
            return;
        }
    };

    const handleRGBInput = (newValue: string, rgb: "r" | "g" | "b") => {
        const numValue = parseInt(newValue);
        if (isNaN(numValue) || numValue < 0 || numValue > 255) {
            return;
        }
        batch(() => {
            setRgbStr(prev => {
                if (!prev) return null;
                return { 
                    ...prev, 
                    [rgb]: newValue,
                };
            });
            setRgbColor(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    [rgb]: numValue,
                };
            });
            setRGBBatch(true);
            setSelectedColor(prev => {
                const prevRGB = hslToRgb(prev);
                const newRGB: RGBColor = {
                    ...prevRGB,
                    [rgb]: numValue,
                }
                return rgbToHsl(newRGB);
            });
            setSelectedColorFrom("input");
        });
    };

    const handleRGBChange = (e: Event, rgb: "r" | "g" | "b") => {
        const value = (e.target as HTMLInputElement).value;
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 0 || numValue > 255) {
            (e.target as HTMLInputElement).value = rgbStr() !== null ? rgbStr()![rgb] : "";
        }
    }

    const handleHueBeforeInput = (e: InputEvent) => {
        if (e.inputType === "insertText" 
            && !hueValidChars.includes((e.data || "").toLowerCase())) {
            e.preventDefault();
            return;
        }
        if (e.inputType === "insertText") {
            e.preventDefault();
            const insertChar = e.data || "";
            const insertIndex = (e.target as HTMLInputElement).selectionStart || 0;
            const value = (e.target as HTMLInputElement).value;
            const newValue = value.substring(0, insertIndex) + insertChar + value.substring(insertIndex);
            const numValue = parseInt(newValue);
            if (isNaN(numValue) || numValue < 0 || numValue > 359) {
                return;
            }
            (e.target as HTMLInputElement).value = newValue;
            (e.target as HTMLInputElement).setSelectionRange(insertIndex + 1, insertIndex + 1);
            handleHueInput(newValue);
            return;
        }
    };

    const handleHueInput = (newValue: string) => {
        const numValue = parseInt(newValue);
        if (isNaN(numValue) || numValue < 0 || numValue > 359) {
            return;
        }
        batch(() => {
            setHslStr(prev => {
                if (!prev) return null;
                return { 
                    ...prev, 
                    h: newValue,
                };
            });
            setHSLBatch(true);
            setSelectedColor(prev => {
                return { 
                    ...prev, 
                    h: numValue,
                };
            });
            setSelectedColorFrom("input");
        });
    };

    const handleHueChange = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 0 || numValue > 359) {
            (e.target as HTMLInputElement).value = hslStr() !== null ? hslStr()!.h : "";
        }
    };

    const handleSaturationBeforeInput = (e: InputEvent) => {
        if (e.inputType === "insertText" 
            && !saturationValidChars.includes((e.data || "").toLowerCase())) {
            e.preventDefault();
            return;
        }
        if (e.inputType === "insertText") {
            e.preventDefault();
            const insertChar = e.data || "";
            const insertIndex = (e.target as HTMLInputElement).selectionStart || 0;
            const value = (e.target as HTMLInputElement).value;
            const newValue = value.substring(0, insertIndex) + insertChar + value.substring(insertIndex);
            const numValue = parseInt(newValue);
            if (isNaN(numValue) || numValue < 0 || numValue > 100) {
                return;
            }
            (e.target as HTMLInputElement).value = newValue;
            (e.target as HTMLInputElement).setSelectionRange(insertIndex + 1, insertIndex + 1);
            handleSaturationInput(newValue);
            return;
        }
    };

    const handleSaturationInput = (newValue: string) => {
        const numValue = parseInt(newValue);
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
            return;
        }
        batch(() => {
            setHslStr(prev => {
                if (!prev) return null;
                return { 
                    ...prev, 
                    s: newValue,
                };
            });
            setHSLBatch(true);
            setSelectedColor(prev => {
                return { 
                    ...prev, 
                    s: numValue,
                };
            });
            setSelectedColorFrom("input");
        });
    };

    const handleSaturationChange = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
            (e.target as HTMLInputElement).value = hslStr() !== null ? hslStr()!.s : "";
        }
    };

    const handleLightnessBeforeInput = (e: InputEvent) => {
        if (e.inputType === "insertText" 
            && !lightnessValidChars.includes((e.data || "").toLowerCase())) {
            e.preventDefault();
            return;
        }
        if (e.inputType === "insertText") {
            e.preventDefault();
            const insertChar = e.data || "";
            const insertIndex = (e.target as HTMLInputElement).selectionStart || 0;
            const value = (e.target as HTMLInputElement).value;
            const newValue = value.substring(0, insertIndex) + insertChar + value.substring(insertIndex);
            const numValue = parseInt(newValue);
            if (isNaN(numValue) || numValue < 0 || numValue > 100) {
                return;
            }
            (e.target as HTMLInputElement).value = newValue;
            (e.target as HTMLInputElement).setSelectionRange(insertIndex + 1, insertIndex + 1);
            handleLightnessInput(newValue);
            return;
        }
    };

    const handleLightnessInput = (newValue: string) => {
        const numValue = parseInt(newValue);
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
            return;
        }
        batch(() => {
            setHslStr(prev => {
                if (!prev) return null;
                return { 
                    ...prev, 
                    l: newValue,
                };
            });
            setHSLBatch(true);
            setSelectedColor(prev => {
                return { 
                    ...prev, 
                    l: numValue,
                };
            });
            setSelectedColorFrom("input");
        });
    };

    const handleLightnessChange = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
            (e.target as HTMLInputElement).value = hslStr() !== null ? hslStr()!.l : "";
        }
    };

    const handleAlphaBeforeInput = (e: InputEvent) => {
        if (e.inputType === "insertText") {
            e.preventDefault();
            const insertChar = e.data || "";
            const insertIndex = (e.target as HTMLInputElement).selectionStart || 0;
            const value = (e.target as HTMLInputElement).value;
            let newValue = value.substring(0, insertIndex) + insertChar + value.substring(insertIndex);
            const numValue = parseFloat(newValue);
            if (isNaN(numValue) || numValue < 0 || numValue > 1) {
                return;
            }
            const decimalIndex = newValue.indexOf(".");
            if (decimalIndex !== -1) {
                const decimalLength = newValue.length - decimalIndex - 1;
                if (decimalLength > displayAlphaPrecision) {
                    return;
                }
            }
            (e.target as HTMLInputElement).value = newValue;
            (e.target as HTMLInputElement).setSelectionRange(insertIndex + 1, insertIndex + 1);
            handleAlphaInput(newValue);
            return;
        }
    };

    const handleAlphaInput = (newValue: string) => {
        const numValue = parseFloat(newValue);
        if (isNaN(numValue) || numValue < 0 || numValue > 1) {
            return;
        }
        batch(() => {
            setAlphaBatch(true);
            setAlphaStr(newValue);
            setSelectedColor(prev => {
                return { 
                    ...prev, 
                    a: numValue,
                };
            });
            setSelectedColorFrom("input");
            setRgbColor(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    a: numValue,
                };
            });
        });
    };

    const handleAlphaChange = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0 || numValue > 1) {
            (e.target as HTMLInputElement).value = alphaStr();
        }
    };

    const ApplyButtonComponent = props.customApplyButton || DefaultColorPickerApplyButton;

    return (
        <div 
            class={`rounded shadow-md flex flex-col pt-2 items-center ${props.class}`}
            classList={{
            ...(props.classList || {}),
            }}
            ref={pickerRef}
        >
            <div class="w-full p-2 relative h-8">
                <span 
                    class="text-xl font-bold font-sans"
                >
                    Custom Color Picker
                </span>
                <div class="absolute top-2 right-2 p-1">
                    <div 
                        onClick={() => {
                            props.onClose && props.onClose("cancel");
                            props.handleClose();
                        }}
                        classList={{
                            "cursor-pointer": !props.ignoreClick,
                        }}
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>
            </div>
            <div class="mt-4 flex items-center w-full justify-around">
                <div class="flex flex-col items-center justify-center">
                    <ColorCanvas
                        width={320}
                        height={320}
                        dimension="both"
                        position={{
                            pos: {
                                x: selectedColor() ? selectedColor()!.s : 0,
                                y: selectedColor() ? selectedColor()!.l : 0,
                            },
                            cause: selectedColorFrom() === "canvas" ? "this" : "other",
                        }}
                        onChange={slCanvasOnChange}
                        xMax={100}
                        xMin={0}
                        xPrecision={props.precisions?.saturation || hslSaturationFixedPrecision}
                        yMax={100}
                        yMin={0}
                        yPrecision={props.precisions?.lightness || hslLightnessFixedPrecision}
                        xDirection="right"
                        yDirection="top"
                        verticalGradientPaint={slCanvasVerticalGradient}
                        horizontalGradientPaint={slCanvasHorizontalGradient}
                        canvasResetBatch={{
                            value: recalcSLCanvas(),
                            set: setRecalcSLCanvas,
                            tryHit: 2,
                            exceptHit: ["mouseMove", "mouseDown", "propPostUpdate"],
                        }}
                    />
                    <div class="mt-3">
                        <ColorCanvas
                            width={320}
                            height={32}
                            dimension="width"
                            position={{
                                pos: {
                                    x: selectedColor() ? selectedColor()!.h : 0,
                                    y: 0,
                                },
                                cause: selectedColorFrom() === "canvas" ? "this" : "other",
                            }}
                            onChange={hCanvasOnChange}
                            xMax={359}
                            xMin={0}
                            xPrecision={props.precisions?.hue || displayHuePrecision}
                            canvasResetBatch={{
                                value: recalcHCanvas(),
                                set: setRecalcHCanvas,
                                tryHit: 2,
                                exceptHit: ["mouseMove", "mouseDown", "propPostUpdate"],
                            }}
                            xDirection="right"
                            horizontalGradientPaint={hCanvasHorizontalGradient}
                        />
                    </div>
                </div>
                <div class="w-[4rem] h-full flex flex-col items-center justify-between py-4">
                    <ColorCanvas
                        width={36}
                        height={280}
                        dimension="height"
                        position={{
                            pos: {
                                x: 0,
                                y: selectedColor() ? selectedColor()!.a : 1,
                            },
                            cause: selectedColorFrom() === "canvas" ? "this" : "other",
                        }}
                        onChange={aCanvasOnChange}
                        yMax={1}
                        yMin={0}
                        yPrecision={props.precisions?.alpha || alphaFixedPrecision}
                        yDirection="top"
                        verticalGradientPaint={aCanvasVerticalGradient}
                        additionalPaint={aAdditionalPattern}
                        canvasResetBatch={{
                            value: recalcACanvas(),
                            set: setRecalcACanvas,
                            tryHit: 2,
                            exceptHit: ["mouseMove", "mouseDown", "propPostUpdate"],
                        }}
                    />
                    <div class="mt-5">
                        <div 
                        class="w-[3rem] h-[3rem] rounded border border-gray-300" 
                        style={{ 
                            "background-color": colorStr() || "inherit",
                        }} />
                    </div>
                </div>
            </div>
            <div class="my-3 grid grid-cols-7 gap-2 px-2 h-14">
                {/* (Hex Or RGB Or HSL)*/}
                <div class="col-span-4 shadow-sm rounded border border-gray-300 flex items-center">
                    <div class="h-full w-full flex items-center grow justify-around px-2">
                        <Switch>
                            <Match when={displayStyle() === "hex"}>
                                <div class="w-full flex items-center justify-center">
                                    <div 
                                        class="flex py-1 items-center px-2 pointer-events-none text-gray-500 font-bold text-2xl select-none rounded-l shadow-sm border-r border-gray-300 bg-gray-300">
                                        #
                                    </div>
                                    <input 
                                        type="text" 
                                        class="w-20 text-center outline-none border border-gray-300 rounded-r shadow-sm py-2"
                                        value={hexStr()}
                                        onbeforeinput={(e: InputEvent) => handleHexBeforeInput(e)}
                                        oninput={(e: Event) => handleHexInput((e.target as HTMLInputElement).value)}
                                        onchange={handelHexChange}
                                    />
                                </div>
                            </Match>
                            <Match when={displayStyle() === "rgb"}>
                                <div class="flex flex-col items-center justify-center gap-1">
                                    <input 
                                        type="text" 
                                        value={rgbStr() !== null ? rgbStr()!.r : ""}
                                        class="w-8 text-center outline-none border border-gray-300 rounded shadow-sm"
                                        onbeforeinput={(e: InputEvent) => handelRGBBeforeInput(e, "r")}
                                        oninput={(e: Event) => handleRGBInput((e.target as HTMLInputElement).value, "r")}
                                        onchange={(e: Event) => handleRGBChange(e, "r")}
                                    />
                                    <div class="text-center text-xs font-light">
                                        R
                                    </div>
                                </div>
                                <div class="flex flex-col items-center justify-center gap-1">
                                    <input
                                        type="text"
                                        value={rgbStr() !== null ? rgbStr()!.g : ""}
                                        class="w-8 text-center outline-none border border-gray-300 rounded shadow-sm"
                                        onbeforeinput={(e: InputEvent) => handelRGBBeforeInput(e, "g")}
                                        oninput={(e: Event) => handleRGBInput((e.target as HTMLInputElement).value, "g")}
                                        onchange={(e: Event) => handleRGBChange(e, "g")}
                                    />
                                    <div class="text-center text-xs font-light">
                                        G
                                    </div>
                                </div>
                                <div class="flex flex-col items-center justify-center gap-1">
                                    <input
                                        type="text"
                                        value={rgbStr() !== null ? rgbStr()!.b : ""}
                                        class="w-8 text-center outline-none border border-gray-300 rounded shadow-sm"
                                        onbeforeinput={(e: InputEvent) => handelRGBBeforeInput(e, "b")}
                                        oninput={(e: Event) => handleRGBInput((e.target as HTMLInputElement).value, "b")}
                                        onchange={(e: Event) => handleRGBChange(e, "b")}
                                    />
                                    <div class="text-center text-xs font-light">
                                        B
                                    </div>
                                </div>
                            </Match>
                            <Match when={displayStyle() === "hsl"}>
                                <div class="flex flex-col items-center justify-center gap-1">
                                    <div class="flex items-start gap-1">
                                        <input
                                            type="text"
                                            value={hslStr() !== null ? hslStr()!.h : 0}
                                            class="w-8 text-center outline-none border border-gray-300 rounded shadow-sm"
                                            onbeforeinput={(e: InputEvent) => handleHueBeforeInput(e)}
                                            oninput={(e: Event) => handleHueInput((e.target as HTMLInputElement).value)}
                                            onchange={handleHueChange}
                                        />
                                        <span class="text-center text-xs font-light">
                                            °
                                        </span>
                                    </div>
                                    <div class="text-center text-xs font-light pr-1">
                                        H
                                    </div>
                                </div>
                                <div class="flex flex-col items-center justify-center gap-1">
                                    <div class="flex items-end gap-1">
                                        <input
                                            type="text"
                                            value={hslStr() !== null ? hslStr()!.s : 0}
                                            class="w-8 text-center outline-none border border-gray-300 rounded shadow-sm"
                                            onbeforeinput={(e: InputEvent) => handleSaturationBeforeInput(e)}
                                            oninput={(e: Event) => handleSaturationInput((e.target as HTMLInputElement).value)}
                                            onchange={handleSaturationChange}
                                        />
                                        <span class="text-center text-xs font-light">
                                            %
                                        </span>
                                    </div>
                                    <div class="text-center text-xs font-light pr-1">
                                        S
                                    </div>
                                </div>
                                <div class="flex flex-col items-center justify-center gap-1">
                                    <div class="flex items-end gap-1">
                                        <input
                                            type="text"
                                            value={hslStr() !== null ? hslStr()!.l : 0}
                                            class="w-8 text-center outline-none border border-gray-300 rounded shadow-sm"
                                            onbeforeinput={(e: InputEvent) => handleLightnessBeforeInput(e)}
                                            oninput={(e: Event) => handleLightnessInput((e.target as HTMLInputElement).value)}
                                            onchange={handleLightnessChange}
                                        />
                                        <span class="text-center text-xs font-light">
                                            %
                                        </span>
                                    </div>
                                    <div class="text-center text-xs font-light pr-1">
                                        L
                                    </div>
                                </div>
                            </Match>
                        </Switch>
                    </div>
                    <div class="h-full flex items-center shrink">
                        <div class="w-[2px] h-5/6 bg-gray-300" />
                        <div 
                            class="rounded-md w-8 h-8 flex items-center justify-center mx-2"
                            classList={{
                                "cursor-pointer hover:bg-gray-300": !props.ignoreClick,
                            }}
                            onClick={() => {
                                if (props.ignoreClick) return;

                                setDisplayStyle(
                                    displayStyle() === "hex" ? "rgb" : 
                                    displayStyle() === "rgb" ? "hsl" : 
                                    "hex"
                                );
                            }}
                        >
                            <ChevronsUpDown size={20} />
                        </div>
                    </div>
                </div>
                {/* Alpha */}
                <div class="flex items-center gap-2 w-12">
                    <div>
                        <input 
                            type="text" 
                            value={alphaStr()}
                            class="w-full text-center outline-none border border-gray-300 rounded shadow-sm"
                            onbeforeinput={(e: InputEvent) => handleAlphaBeforeInput(e)}
                            oninput={(e: Event) => handleAlphaInput((e.target as HTMLInputElement).value)}
                            onchange={handleAlphaChange}
                        />
                        <div class="text-center text-xs font-light">
                            Alpha
                        </div>
                    </div>
                </div>

                {/* Apply Button */}
                <div class="col-span-2 flex items-end justify-end px-1">
                    <ApplyButtonComponent
                        ignoreClick={props.ignoreClick}
                        colorRGB={rgbColor()}
                        colorHSL={selectedColor()}
                        colorHex={hexStr()}
                        colorStr={colorStr()}
                        setColor={props.setColor}
                        handleClose={() => {
                            props.onClose && props.onClose("apply");
                            props.handleClose();
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;
