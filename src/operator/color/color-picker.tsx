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
    colorToHSL, 
    colorToString, 
    hexToHsl, 
    hslToHex, 
    hslToRgb, 
    resolveColor,
    rgbToHsl,
} from "./utils";
import {
    Color,
    HSLColor, 
    RGBColor,
} from "./types";
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
    hslHueFixedPrecision, 
    hslLightnessFixedPrecision, 
    hslSaturationFixedPrecision, 
    rgbFixedPrecision,
    DefaultHSLColor,
    defaultColorPickerTitle, 
} from "./const";
import { preValidateNumInput } from "../../hooks/use-pre-validate-num-input";

interface ColorPickerProps {
    title?: string;
    alphaLabel?: string;
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

const ColorPicker = (props: ColorPickerProps) => {
    const colorOptions = createMemo(() => {
        return {
            rgbPrecision: props.precisions?.rgb || rgbFixedPrecision,
            hslHuePrecision: props.precisions?.hue || hslHueFixedPrecision,
            hslSaturationPrecision: props.precisions?.saturation || hslSaturationFixedPrecision,
            hslLightnessPrecision: props.precisions?.lightness || hslLightnessFixedPrecision,
            alphaPrecision: props.precisions?.alpha || alphaFixedPrecision,
        };
    });
    const [selectedColor, setSelectedColor] = createSignal<HSLColor>(
        props.defaultColor ? colorToHSL(props.defaultColor, colorOptions()) : DefaultHSLColor
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
                    props.defaultColor ? colorToHSL(props.defaultColor, colorOptions()) : DefaultHSLColor
                );
                setSelectedColorFrom("prop");
            });
            return;
        }
        const color = resolveColor(props.color);
        const hsl = colorToHSL(color, colorOptions());
        batch(() => {
            setSelectedColor(hsl);
            setSelectedColorFrom("prop");
        });
    });

    // Set the color prop for display when the selected color changes
    const colorStr = createMemo(() => {
        if (!selectedColor()) return null;
        return colorToString(selectedColor()!, props.colorStrFormat, selectedColor().a, colorOptions());
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
        setHexStr(hslToHex(selectedColor()!, colorOptions()).replace("#", "").toUpperCase());
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
            setAlphaStr((fixFloatingPoint(alpha, 10 ** (props.precisions?.displayAlpha || displayAlphaPrecision)) / 10 ** 
                (props.precisions?.displayAlpha || displayAlphaPrecision)).toString());
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
        const rgb = hslToRgb(selectedColor()!, colorOptions());
        batch(() => {
            setRgbStr({
                r: (fixFloatingPoint(rgb.r, 10 ** (props.precisions?.displayRGB || displayRGBPrecision)) / 10 ** (props.precisions?.displayRGB || displayRGBPrecision)).toString(),
                g: (fixFloatingPoint(rgb.g, 10 ** (props.precisions?.displayRGB || displayRGBPrecision)) / 10 ** (props.precisions?.displayRGB || displayRGBPrecision)).toString(),
                b: (fixFloatingPoint(rgb.b, 10 ** (props.precisions?.displayRGB || displayRGBPrecision)) / 10 ** (props.precisions?.displayRGB || displayRGBPrecision)).toString(),
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
                h: (fixFloatingPoint(selectedColor()!.h, 10 ** (props.precisions?.displayHue || displayHuePrecision)) / 10 ** (props.precisions?.displayHue || displayHuePrecision)).toString(),
                s: (fixFloatingPoint(selectedColor()!.s, 10 ** (props.precisions?.displaySaturation || displaySaturationPrecision)) / 10 ** (props.precisions?.displaySaturation || displaySaturationPrecision)).toString(),
                l: (fixFloatingPoint(selectedColor()!.l, 10 ** (props.precisions?.displayLightness || displayLightnessPrecision)) / 10 ** (props.precisions?.displayLightness || displayLightnessPrecision)).toString(),
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
                const hsl = hexToHsl("#" + newValue, selectedColor() !== null ? selectedColor()!.a : 1, colorOptions());
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

    const handleRGBInputFactory = (rgb: "r" | "g" | "b") => {
        return (rawValue: string, numValue: number|null) => {
            batch(() => {
                setRgbStr(prev => {
                    if (!prev) return null;
                    return { 
                        ...prev, 
                        [rgb]: rawValue,
                    };
                });
                if (numValue === null) return;
                setRGBBatch(true);
                setSelectedColor(prev => {
                    const prevRGB = hslToRgb(prev);
                    const newRGB: RGBColor = {
                        ...prevRGB,
                        [rgb]: numValue,
                    }
                    return rgbToHsl(newRGB, colorOptions());
                });
                setSelectedColorFrom("input");
            });
        }
    }

    const calcAccurateRGBFactory = (rgb: "r" | "g" | "b") => {
        return () => {
            let value = rgbColor()![rgb];
            return fixFloatingPoint(
                value, 
                10 ** (props.precisions?.displayRGB || displayRGBPrecision)) / 10 ** (props.precisions?.displayRGB || displayRGBPrecision);
        }
    }

    const handleHueInput = (rawValue: string, numValue: number|null) => {
        batch(() => {
            setHslStr(prev => {
                if (!prev) return null;
                return { 
                    ...prev, 
                    h: rawValue,
                };
            });
            if (numValue === null) return;
            setHSLBatch(true);
            setSelectedColor(prev => {
                return { 
                    ...prev, 
                    h: numValue,
                };
            });
            setSelectedColorFrom("input");
        });
    }

    const calcAccurateHue = () => {
        let hue = selectedColor()!.h;
        return fixFloatingPoint(
            hue, 
            10 ** (props.precisions?.displayHue || displayHuePrecision)) / 10 ** (props.precisions?.displayHue || displayHuePrecision);
    }

    const handleSaturationInput = (rawValue: string, numValue: number|null) => {
        batch(() => {
            setHslStr(prev => {
                if (!prev) return null;
                return { 
                    ...prev, 
                    s: rawValue,
                };
            });
            if (numValue === null) return;
            setHSLBatch(true);
            setSelectedColor(prev => {
                return { 
                    ...prev, 
                    s: numValue,
                };
            });
            setSelectedColorFrom("input");
        });
    }

    const calcAccurateSaturation = () => {
        let saturation = selectedColor()!.s;
        return fixFloatingPoint(
            saturation, 
            10 ** (props.precisions?.displaySaturation || displaySaturationPrecision)) / 10 ** (props.precisions?.displaySaturation || displaySaturationPrecision);
    }

    const handleLightnessInput = (rawValue: string, numValue: number|null) => {
        batch(() => {
            setHslStr(prev => {
                if (!prev) return null;
                return { 
                    ...prev, 
                    l: rawValue,
                };
            });
            if (numValue === null) return;
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

    const calcAccurateLightness = () => {
        let lightness = selectedColor()!.l;
        return fixFloatingPoint(
            lightness, 
            10 ** (props.precisions?.displayLightness || displayLightnessPrecision)) / 10 ** (props.precisions?.displayLightness || displayLightnessPrecision);
    }

    const handleAlphaInput = (rawValue: string, numValue: number|null) => {
        batch(() => {
            setAlphaStr(rawValue);            
            if (numValue === null) return;
            setAlphaBatch(true);
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

    const calcAccurateAlpha = () => {
        let alpha = selectedColor()!.a;
        return fixFloatingPoint(
            alpha, 
            10 ** (props.precisions?.displayAlpha || displayAlphaPrecision)) / 10 ** (props.precisions?.displayAlpha || displayAlphaPrecision);
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
                    {props.title || defaultColorPickerTitle}
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
                            xPrecision={props.precisions?.hue || hslHueFixedPrecision}
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
                                        use:preValidateNumInput={{
                                            validateOptions: {
                                                precision: props.precisions?.displayRGB || displayRGBPrecision,
                                                max: 255,
                                                min: 0,
                                            },
                                            accurateValue: calcAccurateRGBFactory("r"),
                                            handleInput: handleRGBInputFactory("r"),
                                        }}
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
                                        use:preValidateNumInput={{
                                            validateOptions: {
                                                precision: props.precisions?.displayRGB || displayRGBPrecision,
                                                max: 255,
                                                min: 0,
                                            },
                                            accurateValue: calcAccurateRGBFactory("g"),
                                            handleInput: handleRGBInputFactory("g"),
                                        }}
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
                                        use:preValidateNumInput={{
                                            validateOptions: {
                                                precision: props.precisions?.displayRGB || displayRGBPrecision,
                                                max: 255,
                                                min: 0,
                                            },
                                            accurateValue: calcAccurateRGBFactory("b"),
                                            handleInput: handleRGBInputFactory("b"),
                                        }}
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
                                            use:preValidateNumInput={{
                                                validateOptions: {
                                                    precision: props.precisions?.displayHue || displayHuePrecision,
                                                    max: 359,
                                                    min: 0,
                                                },
                                                accurateValue: calcAccurateHue,
                                                handleInput: handleHueInput,
                                            }}
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
                                            use:preValidateNumInput={{
                                                validateOptions: {
                                                    precision: props.precisions?.displaySaturation || displaySaturationPrecision,
                                                    max: 100,
                                                    min: 0,
                                                },
                                                accurateValue: calcAccurateSaturation,
                                                handleInput: handleSaturationInput,
                                            }}
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
                                            use:preValidateNumInput={{
                                                validateOptions: {
                                                    precision: props.precisions?.displayLightness || displayLightnessPrecision,
                                                    max: 100,
                                                    min: 0,
                                                },
                                                accurateValue: calcAccurateLightness,
                                                handleInput: handleLightnessInput,
                                            }}
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
                            use:preValidateNumInput={{
                                validateOptions: {
                                    precision: props.precisions?.displayAlpha || displayAlphaPrecision,
                                    max: 1,
                                    min: 0,
                                },
                                accurateValue: calcAccurateAlpha,
                                handleInput: handleAlphaInput,
                            }}
                        />
                        <div class="text-center text-xs font-light">
                            {props.alphaLabel || "alpha"}
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
