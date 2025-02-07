import { createSignal, createEffect, onMount, onCleanup, createMemo, Switch, Match, batch } from "solid-js";
import { globalCursorAction } from "../store/action";
import { 
    alphaFixedPrecision, 
    colorToHSL, 
    colorToString, 
    hexToHsl, 
    HSLColor, 
    hslHueFixedPrecision, 
    hslLightnessFixedPrecision, 
    hslSaturationFixedPrecision, 
    hslToHex, 
    hslToRgb, 
    resolveColor,
    RGBColor,
    rgbToHsl,
} from "../utils/color";
import { ChevronsUpDown } from "lucide-solid";
import { fixFloatingPoint } from "../utils/calc";

interface ColorPickerProps {
    class?: string;
    classList?: Record<string, boolean>;
    handleClose: () => void;
    color: string;
    setColor: (color: string) => void;
    closeIgnoreRef?: HTMLDivElement;
    setParentIgnoreOutsideClick?: (value: boolean) => void;
}

const pickerCircleRadiusPad = 5, canvasRadius = 12;
const displayAlphaPrecision = 2;
const displayRGBPrecision = 0;
const displayHuePrecision = 0;
const displaySaturationPrecision = 0;
const displayLightnessPrecision = 0;
const hexValidChars = "0123456789abcdefABCDEF";
const rgbValidChars = "0123456789";
const hueValidChars = "0123456789";
const saturationValidChars = "0123456789";
const lightnessValidChars = "0123456789";

const ColorPicker = (props: ColorPickerProps) => {
    const [selectedColor, setSelectedColor] = createSignal<HSLColor|null>(null);
    const [displayStyle, setDisplayStyle] = createSignal<"hex" | "rgb" | "hsl">("hex");
    const [huePickerDragging, setHuePickerDragging] = createSignal(false);
    const [opacityPickerDragging, setOpacityPickerDragging] = createSignal(false);
    const [canvasColorDragging, setCanvasColorDragging] = createSignal(false);
    const [hexStr, setHexStr] = createSignal("");
    const [_HexBatch, setHexBatch] = createSignal(false);
    const [rgbStr, setRgbStr] = createSignal<{ r: string, g: string, b: string } | null>(null);
    const [_RGBBatch, setRGBBatch] = createSignal(false);
    const [hslStr, setHslStr] = createSignal<{ h: string, s: string, l: string } | null>(null);
    const [_HSLBatch, setHSLBatch] = createSignal(false);
    const [alphaStr, setAlphaStr] = createSignal("");
    const [_AlphaBatch, setAlphaBatch] = createSignal(false);

    createEffect(() => {
        if (!props.color) {
            setSelectedColor(null);
            return;
        }
        const color = resolveColor(props.color);
        const hsl = colorToHSL(color);
        setSelectedColor(hsl);
    });

    const colorStr = createMemo(() => {
        if (!selectedColor()) return null;
        return colorToString(selectedColor()!);
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
        if (displayStyle() === "hex") {
            setHexStr(hslToHex(selectedColor()!).replace("#", "").toUpperCase());
        }
    });

    createEffect(() => {
        if (!selectedColor()) return;
        let batch = false;
        setAlphaBatch(prev => {
            if (prev) {
                batch = true;
            }
            return false;
        });
        if (batch) return;
        const alpha = selectedColor()!.a;
        setAlphaStr((fixFloatingPoint(alpha, 10 ** displayAlphaPrecision) / 10 ** displayAlphaPrecision).toString());
    });

    createEffect(() => {
        if (!selectedColor()) return;
        let batch = false;
        setRGBBatch(prev => {
            if (prev) {
                batch = true;
            }
            return false;
        });
        if (batch) return;
        if (displayStyle() === "rgb") {
            const rgb = hslToRgb(selectedColor()!);
            setRgbStr({
                r: (fixFloatingPoint(rgb.r, 10 ** displayRGBPrecision) / 10 ** displayRGBPrecision).toString(),
                g: (fixFloatingPoint(rgb.g, 10 ** displayRGBPrecision) / 10 ** displayRGBPrecision).toString(),
                b: (fixFloatingPoint(rgb.b, 10 ** displayRGBPrecision) / 10 ** displayRGBPrecision).toString(),
            });
        }
    });

    createEffect(() => {
        if (!selectedColor()) return;
        let batch = false;
        setHSLBatch(prev => {
            if (prev) {
                batch = true;
            }
            return false;
        });
        if (batch) return;
        if (displayStyle() === "hsl") {
            setHslStr({
                h: (fixFloatingPoint(selectedColor()!.h, 10 ** displayHuePrecision) / 10 ** displayHuePrecision).toString(),
                s: (fixFloatingPoint(selectedColor()!.s, 10 ** displaySaturationPrecision) / 10 ** displaySaturationPrecision).toString(),
                l: (fixFloatingPoint(selectedColor()!.l, 10 ** displayLightnessPrecision) / 10 ** displayLightnessPrecision).toString(),
            });
        }
    });

    let canvasRef: HTMLCanvasElement | undefined;
    let huePickerCanvasRef: HTMLCanvasElement | undefined;
    let opacityPickerCanvasRef: HTMLCanvasElement | undefined;
    let ctx: CanvasRenderingContext2D | null = null;

    let pickerRef: HTMLDivElement | undefined
    const [ignoreOutsideClick, setIgnoreOutsideClick] = createSignal(false);

    const handleClickOutside = (event: MouseEvent) => {
        if (globalCursorAction() ) return;

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
            props.handleClose();
        }
    };

    const handleMouseUp = () => {
        setHuePickerDragging(false);
        setOpacityPickerDragging(false);
        setCanvasColorDragging(false);
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (canvasRef && canvasColorDragging()) {
            const rect = canvasRef.getBoundingClientRect();
            const circleRadius = canvasRadius + pickerCircleRadiusPad;
            const pickerWidth = canvasRef.width - (circleRadius * 2);
            const pickerHeight = canvasRef.height - (circleRadius * 2);
            const x = event.clientX - (rect.left + circleRadius);
            const y = event.clientY - (rect.top + circleRadius);
            let newSaturation = (x / pickerWidth) * 100;
            newSaturation = fixFloatingPoint(newSaturation, 10 ** hslSaturationFixedPrecision) / 10 ** hslSaturationFixedPrecision;
            newSaturation = Math.max(0, Math.min(100, newSaturation));
            let newLightness = 100 - (y / pickerHeight) * 100;
            newLightness = fixFloatingPoint(newLightness, 10 ** hslLightnessFixedPrecision) / 10 ** hslLightnessFixedPrecision;
            newLightness = Math.max(0, Math.min(100, newLightness));
            setSelectedColor(prev => {
                if (!prev) return null;
                if (prev.s === newSaturation && prev.l === newLightness) return prev;
                return { 
                    ...prev, 
                    s: newSaturation,
                    l: newLightness,
                };
            });
        }
        if (huePickerCanvasRef && huePickerDragging()) {
            const rect = huePickerCanvasRef.getBoundingClientRect();
            const circleRadius = (huePickerCanvasRef.height / 2) + pickerCircleRadiusPad;
            const pickerWidth = huePickerCanvasRef.width - (circleRadius * 2);
            let newHue = ((event.clientX - (rect.left + circleRadius)) / pickerWidth) * 360;
            newHue = fixFloatingPoint(newHue, 10 ** hslHueFixedPrecision) / 10 ** hslHueFixedPrecision
            newHue = Math.max(0, Math.min(359, newHue));
            setSelectedColor(prev => {
                if (!prev) return null;
                if (prev.h === newHue) return prev;
                return { 
                    ...prev, 
                    h: newHue,
                };
            });
        }
        if (opacityPickerCanvasRef && opacityPickerDragging()) {
            const rect = opacityPickerCanvasRef.getBoundingClientRect();
            const circleRadius = (opacityPickerCanvasRef.width / 2) + pickerCircleRadiusPad;
            const pickerHeight = opacityPickerCanvasRef.height - (circleRadius * 2);
            let newAlpha = 1 - ((event.clientY - (rect.top + circleRadius)) / pickerHeight);
            newAlpha = fixFloatingPoint(newAlpha, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision;
            newAlpha = Math.max(0, Math.min(1, newAlpha));
            setSelectedColor(prev => {
                if (!prev) return null;
                if (prev.a === newAlpha) return prev;
                return { 
                    ...prev, 
                    a: newAlpha,
                };
            });
        }
    };

    onMount(() => {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mousemove", handleMouseMove);
    });

    onCleanup(() => {
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mousemove", handleMouseMove);
    });

    const updateCanvas = () => {
        if (!canvasRef) return;
        ctx = canvasRef.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

        const circleRadius = canvasRadius + pickerCircleRadiusPad;
        const pickerWidth = canvasRef.width - (circleRadius * 2);
        const pickerHeight = canvasRef.height - (circleRadius * 2);

        const currentHSL = selectedColor() || { h: 0, s: 0, l: 0, a: 1 };
        const currentHue = currentHSL.h;
        const currentSaturation = currentHSL.s;
        const currentLightness = currentHSL.l;

        // Blend the hue with white and black
        const vertGradient = ctx.createLinearGradient(0, 0, 0, pickerHeight);
        vertGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        vertGradient.addColorStop(1, "rgba(0, 0, 0, 1)");
        ctx.fillStyle = vertGradient;
        ctx.fillRect(circleRadius, circleRadius, pickerWidth, pickerHeight);

        const horzGradient = ctx.createLinearGradient(0, 0, pickerWidth, 0);
        horzGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        horzGradient.addColorStop(1, `hsl(${currentHue}, 100%, 50%)`);
        ctx.fillStyle = horzGradient;
        ctx.globalCompositeOperation = "color";
        ctx.fillRect(circleRadius, circleRadius, pickerWidth, pickerHeight);
        ctx.globalCompositeOperation = "source-over";
        
        const x = (currentSaturation / 100) * pickerWidth;
        const y = (1 - currentLightness / 100) * pickerHeight;
        ctx.beginPath();
        ctx.arc(x + circleRadius, y + circleRadius, circleRadius - pickerCircleRadiusPad - 1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
        ctx.stroke();
        ctx.closePath();
    };

    const handleCanvasMouseDown = (event: MouseEvent) => {
        setCanvasColorDragging(true);
        if (!canvasRef) return;
        const rect = canvasRef.getBoundingClientRect();
        const circleRadius = canvasRadius + pickerCircleRadiusPad;
        const pickerWidth = canvasRef.width - (circleRadius * 2);
        const pickerHeight = canvasRef.height - (circleRadius * 2);
        const x = event.clientX - (rect.left + circleRadius);
        const y = event.clientY - (rect.top + circleRadius);
        let newSaturation = (x / pickerWidth) * 100;
        newSaturation = fixFloatingPoint(newSaturation, 10 ** hslSaturationFixedPrecision) / 10 ** hslSaturationFixedPrecision;
        newSaturation = Math.max(0, Math.min(100, newSaturation));
        let newLightness = 100 - (y / pickerHeight) * 100;
        newLightness = fixFloatingPoint(newLightness, 10 ** hslLightnessFixedPrecision) / 10 ** hslLightnessFixedPrecision;
        newLightness = Math.max(0, Math.min(100, newLightness));
        setSelectedColor(prev => {
            if (!prev) return null;
            if (prev.s === newSaturation && prev.l === newLightness) return prev;
            
            return { 
                ...prev, 
                s: newSaturation,
                l: newLightness,
            };
        });
    };

    const handleCanvasMouseUp = () => {
        setCanvasColorDragging(false);
    };

    const updateHuePickerCanvas = () => {
        if (!huePickerCanvasRef) return;
        const ctx = huePickerCanvasRef.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, huePickerCanvasRef.width, huePickerCanvasRef.height);

        const circleRadius = (huePickerCanvasRef.height / 2) + pickerCircleRadiusPad;
        const pickerWidth = huePickerCanvasRef.width - (circleRadius * 2);
        const pickerHeight = huePickerCanvasRef.height - (pickerCircleRadiusPad * 2);

        const gradient = ctx.createLinearGradient(0, 0, pickerWidth, 0);
        gradient.addColorStop(0, "rgba(255, 0, 0, 1)");
        gradient.addColorStop(0.17, "rgba(255, 255, 0, 1)");
        gradient.addColorStop(0.34, "rgba(0, 255, 0, 1)");
        gradient.addColorStop(0.51, "rgba(0, 255, 255, 1)");
        gradient.addColorStop(0.68, "rgba(0, 0, 255, 1)");
        gradient.addColorStop(0.85, "rgba(255, 0, 255, 1)");
        gradient.addColorStop(1, "rgba(255, 0, 0, 1)");
        ctx.fillStyle = gradient;
        ctx.fillRect(circleRadius, pickerCircleRadiusPad, pickerWidth, pickerHeight);

        const currentHue = (selectedColor() === null) ? 0 : selectedColor()!.h;
        const huePosition = (currentHue / 360) * pickerWidth;

        ctx.beginPath();
        ctx.arc(huePosition + circleRadius, huePickerCanvasRef.height / 2, circleRadius - pickerCircleRadiusPad - 1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.stroke();
        ctx.closePath();
    };

    const handleHuePickerMouseDown = (event: MouseEvent) => {
        setHuePickerDragging(true);
        if (!huePickerCanvasRef) return;
        const rect = huePickerCanvasRef.getBoundingClientRect();
        const circleRadius = (huePickerCanvasRef.height / 2) + pickerCircleRadiusPad;
        const pickerWidth = huePickerCanvasRef.width - (circleRadius * 2);
        let newHue = ((event.clientX - (rect.left + circleRadius)) / pickerWidth) * 360;
        newHue = fixFloatingPoint(newHue, 10 ** hslHueFixedPrecision) / 10 ** hslHueFixedPrecision
        newHue = Math.max(0, Math.min(359, newHue));
        setSelectedColor(prev => {
            if (!prev) return null;
            if (prev.h === newHue) return prev;
            return { 
                ...prev, 
                h: newHue,
            };
        });
    };

    const handleHuePickerMouseUp = () => {
        setHuePickerDragging(false);
    };

    const updateOpacityPickerCanvas = () => {
        if (!opacityPickerCanvasRef) return;
        const ctx = opacityPickerCanvasRef.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, opacityPickerCanvasRef.width, opacityPickerCanvasRef.height);
        const circleRadius = (opacityPickerCanvasRef.width / 2) + pickerCircleRadiusPad;
        const pickerHeight = opacityPickerCanvasRef.height - (circleRadius * 2);
        const pickerWidth = opacityPickerCanvasRef.width - (pickerCircleRadiusPad * 2);

        const gradient = ctx.createLinearGradient(0, 0, 0, pickerHeight);
        const currentHSL = selectedColor() || { h: 0, s: 0, l: 0, a: 1 };
        gradient.addColorStop(0, `hsla(${currentHSL.h}, ${currentHSL.s}%, ${currentHSL.l}%, 1)`);
        gradient.addColorStop(1, `hsla(${currentHSL.h}, ${currentHSL.s}%, ${currentHSL.l}%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(pickerCircleRadiusPad, circleRadius, pickerWidth, pickerHeight);

        const patternSize = 6;
        for (let i = 0; i < pickerHeight / patternSize; i++) {
            for (let j = 0; j < pickerWidth / patternSize; j++) {
                if ((i + j) % 2 === 0) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
                } else {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                }
                const x = j * patternSize + pickerCircleRadiusPad;
                const y = i * patternSize + circleRadius;
                const w = Math.min(patternSize, pickerWidth + pickerCircleRadiusPad - x);
                const h = Math.min(patternSize, pickerHeight + circleRadius - y);
                ctx.fillRect(x, y, w, h);
            }
        }

        const currentAlpha = (selectedColor() === null) ? 1 : selectedColor()!.a;
        const alphaPosition = (1 - currentAlpha) * pickerHeight;

        ctx.beginPath();
        ctx.arc(opacityPickerCanvasRef.width / 2, alphaPosition + circleRadius, circleRadius - pickerCircleRadiusPad - 1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.stroke();
        ctx.closePath();
    };

    const handleOpacityPickerMouseDown = (event: MouseEvent) => {
        setOpacityPickerDragging(true);
        if (!opacityPickerCanvasRef) return;
        const rect = opacityPickerCanvasRef.getBoundingClientRect();
        const circleRadius = (opacityPickerCanvasRef.width / 2) + pickerCircleRadiusPad;
        const pickerHeight = opacityPickerCanvasRef.height - (circleRadius * 2);
        let newAlpha = 1 - ((event.clientY - (rect.top + circleRadius)) / pickerHeight);
        newAlpha = fixFloatingPoint(newAlpha, 10 ** alphaFixedPrecision) / 10 ** alphaFixedPrecision;
        newAlpha = Math.max(0, Math.min(1, newAlpha));
        setSelectedColor(prev => {
            if (!prev) return null;
            if (prev.a === newAlpha) return prev;
            return { 
                ...prev, 
                a: newAlpha,
            };
        });
    }

    const handleOpacityPickerMouseUp = () => {
        setOpacityPickerDragging(false);
    }

    createEffect(() => {
        updateCanvas();
    });

    createEffect(() => {
        updateOpacityPickerCanvas();
    });

    createEffect(() => {
        updateHuePickerCanvas();
    });

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
                setSelectedColor(hsl);
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
            setRGBBatch(true);
            setSelectedColor(prev => {
                if (!prev) return null;
                const prevRGB = hslToRgb(prev);
                const newRGB: RGBColor = {
                    ...prevRGB,
                    [rgb]: numValue,
                }
                return rgbToHsl(newRGB);
            });
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
                if (!prev) return null;
                return { 
                    ...prev, 
                    h: numValue,
                };
            });
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
                if (!prev) return null;
                return { 
                    ...prev, 
                    s: numValue,
                };
            });
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
                if (!prev) return null;
                return { 
                    ...prev, 
                    l: numValue,
                };
            });
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
                            props.setParentIgnoreOutsideClick && props.setParentIgnoreOutsideClick(true);
                            props.handleClose();
                        }}
                        classList={{
                            "cursor-pointer": !globalCursorAction(),
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
                    <canvas 
                        ref={canvasRef} 
                        height={320}
                        width={320}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseUp={handleCanvasMouseUp}
                    />
                    <div class="mt-3">
                        <canvas 
                            ref={huePickerCanvasRef} 
                            width={320}
                            height={32}
                            onMouseDown={handleHuePickerMouseDown}
                            onMouseUp={handleHuePickerMouseUp}
                        />
                    </div>
                </div>
                <div class="w-[4rem] h-full flex flex-col items-center justify-between py-4">
                    <canvas 
                        ref={opacityPickerCanvasRef} 
                        height={280}
                        width={36}
                        onMouseDown={handleOpacityPickerMouseDown}
                        onMouseUp={handleOpacityPickerMouseUp}
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
                                "cursor-pointer hover:bg-gray-300": !globalCursorAction(),
                            }}
                            onClick={() => {
                                if (globalCursorAction()) return;

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

                <div class="col-span-2 flex items-end justify-end px-1">
                    <div 
                        class="text-white rounded px-2 py-1 border border-gray-300 bg-blue-500 flex items-center justify-center"
                        classList={{
                            "cursor-pointer hover:bg-blue-600": !globalCursorAction(),
                        }}
                        onClick={() => {
                            if (globalCursorAction()) return;

                            props.setColor(colorStr() || "");
                            props.handleClose();
                            props.setParentIgnoreOutsideClick && props.setParentIgnoreOutsideClick(true);
                        }}
                    >
                        Apply
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;
