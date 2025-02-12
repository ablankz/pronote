import { batch, createEffect, createSignal, onCleanup, onMount, untrack } from "solid-js";
import { fixFloatingPoint } from "../../../utils/calc";

export interface ColorCanvasProps {
    height?: number | string;
    width?: number | string;
    dimension: "height" | "width" | "both";
    position: {
        pos: CanvasPos;
        cause: "this" | "other";
    };
    onChange: (pos: CanvasPos, from: "internal" | "external") => void;
    xMin?: number;
    xMax?: number;
    xPrecision?: number;
    xDirection?: "left" | "right";
    yMin?: number;
    yMax?: number;
    yPrecision?: number;
    yDirection?: "top" | "bottom";
    pickerCircleOptions?: {
        radiusBase?: number;
        radiusPad?: number;
        radiusReduction?: number;
        hasFill?: boolean;
        fillStyle?: string;
        hasStroke?: boolean;
        strokeStyle?: string;
    };
    verticalGradientPaint?: (
        canvas: CanvasGradient,
        currentPos: CanvasPos,
    ) => void;
    horizontalGradientPaint?: (
        canvas: CanvasGradient,
        currentPos: CanvasPos,
    ) => void;
    additionalPaint?: (
        canvas: CanvasAttr,
        currentPos: CanvasPos,
    ) => void;
    canvasResetBatch?: {
        value: boolean;
        set: (value: boolean) => void;
        tryHit?: number;
        exceptHit?: ('mouseDown' | 'mouseMove' | 'postUpdate' | 'propPostUpdate')[];
    }
    realtimeCanvasUpdate?: boolean;
}

export interface CanvasPos {
    x: number;
    y: number;
}

export interface CanvasAttr {
    circleRadius: number;
    circleRadiusAddPad: number;
    circleRadiusPad: number;
    actCircleRadius: number;
    width: number;
    height: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
    pickerWidth: number;
    pickerHeight: number;
    ctx: CanvasRenderingContext2D;
}

const pickerCircleRadiusBaseDefault = 12;
const pickerCircleRadiusPadDefault = 5;
const pickerCircleRadiusReductionDefault = 1;
const defaultMin = 0;
const defaultMax = 100;
const defaultPrecision = 1;
const defaultPickerCircleFillStyle = "rgba(255, 255, 255, 0.8)";
const defaultPickerCircleStrokeStyle = "rgba(0, 0, 0, 0.8)";
const defaultCanvasResetBatchTryHit = 1;

export const ColorCanvas = (props: ColorCanvasProps) => {
    let canvasRef!: HTMLCanvasElement;
    const [canvasAttr, setCanvasAttr] = createSignal<CanvasAttr|null>(null);
    const [canvasDragging, setCanvasDragging] = createSignal(false);
    const [pos, setPos] = createSignal<{
        pos: CanvasPos,
        viewPos: CanvasPos,
        from: "internal" | "external",
    }>({
        pos: { x: 0, y: 0 },
        viewPos: { x: 0, y: 0 },
        from: "external",
    });
    const [_hit, setHit] = createSignal({
        num: 0,
        except: [] as ('mouseDown' | 'mouseMove' | 'postUpdate' | 'propPostUpdate')[],
    })

    createEffect(() => {
        if (props.position.cause === "this") return;
        const canvas = getOrCreateSetCanvasAttr("propPostUpdate");
        if (!canvas) return;
        const viewPosX = convertPosToViewPos(
            props.position.pos.x, canvas.pickerWidth,
            props.xMax || defaultMax, props.xMin || defaultMin,
            props.xDirection === "left", canvas.circleRadiusAddPad
        )
        const viewPosY = convertPosToViewPos(
            props.position.pos.y, canvas.pickerHeight,
            props.yMax || defaultMax, props.yMin || defaultMin,
            props.yDirection === "top", canvas.circleRadiusAddPad
        )
        setPos({ 
            pos: props.position.pos, 
            viewPos: { x: viewPosX, y: viewPosY },
            from: "external" 
        });
    });

    createEffect(() => {
        props.onChange(pos().pos, pos().from);
    });

    const calcCanvasAttr = (): CanvasAttr | null => {
        if (!canvasRef) return null;
        const ctx = canvasRef.getContext("2d");
        if (!ctx) return null;
        const rect = canvasRef.getBoundingClientRect();
        let circleRadiusAddPad: number, actCircleRadius: number, circleRadius: number;
        const radiusPad = props.pickerCircleOptions?.radiusPad || pickerCircleRadiusPadDefault;
        let pickerWidth = 0, pickerHeight = 0;
        if (props.dimension === "height") {
            circleRadiusAddPad = (canvasRef.width / 2) + (radiusPad);
            circleRadius = (canvasRef.width / 2);
            actCircleRadius = circleRadius - (props.pickerCircleOptions?.radiusReduction || pickerCircleRadiusReductionDefault);
            pickerWidth = canvasRef.width - (radiusPad * 2);
            pickerHeight = canvasRef.height - (circleRadiusAddPad * 2);
        } else if (props.dimension === "width") {
            circleRadiusAddPad = (canvasRef.height / 2) + (radiusPad);
            circleRadius = (canvasRef.height / 2);
            actCircleRadius = circleRadius - (props.pickerCircleOptions?.radiusReduction || pickerCircleRadiusReductionDefault);
            pickerWidth = canvasRef.width - (circleRadiusAddPad * 2);
            pickerHeight = canvasRef.height - (radiusPad * 2);
        } else {
            circleRadiusAddPad = (
                props.pickerCircleOptions?.radiusBase || pickerCircleRadiusBaseDefault
            ) + (radiusPad);
            circleRadius = (
                props.pickerCircleOptions?.radiusBase || pickerCircleRadiusBaseDefault
            );
            actCircleRadius = circleRadius - (props.pickerCircleOptions?.radiusReduction || pickerCircleRadiusReductionDefault);
            pickerWidth = canvasRef.width - (circleRadiusAddPad * 2);
            pickerHeight = canvasRef.height - (circleRadiusAddPad * 2);
        }
        return {
            circleRadius,
            circleRadiusAddPad,
            actCircleRadius,
            circleRadiusPad: radiusPad,
            width: canvasRef.width,
            height: canvasRef.height,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            pickerWidth,
            pickerHeight,
            ctx,
        };
    };

    createEffect(() => {
        const canvas = calcCanvasAttr();
        if (canvas) {
            setCanvasAttr(canvas);
        }
    });

    createEffect(() => {
        let reset = false;
        const canvas = untrack(canvasAttr);
        if (props.canvasResetBatch 
            && props.canvasResetBatch.value
            && !!canvas) {
                props.canvasResetBatch.set(false);
                reset = true;
        }
        if (reset) {
            batch(() => {
                setCanvasAttr(null);
                setHit({
                    num: props.canvasResetBatch?.tryHit || defaultCanvasResetBatchTryHit,
                    except: props.canvasResetBatch?.exceptHit || [],
                });
            });
        }
    });

    const getOrCreateSetCanvasAttr = (from: "mouseDown" | "mouseMove" | "postUpdate" | "propPostUpdate"): CanvasAttr|null => {
        if (props.realtimeCanvasUpdate) return calcCanvasAttr();
        let canvas = canvasAttr();
        if (!canvas) {
            canvas = calcCanvasAttr();
            if (canvas) {
                let needSet = true;
                setHit(prev => {
                    if (prev.num > 0) {
                        needSet = false;
                        if (prev.except.includes(from)) {
                            return prev;
                        }
                        const newRet = {
                            num: prev.num - 1,
                            except: prev.except,
                        };
                        return newRet;
                    }
                    return prev;
                });
                if (needSet) {
                    setCanvasAttr(canvas);
                }
            }
        }
        return canvas;
    };

    const updateCanvas = () => {
        const canvas = getOrCreateSetCanvasAttr("postUpdate");
        if (!canvas) return;

        canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);

        const currentPos = pos();

        if (props.dimension === "height") {
            if (props.verticalGradientPaint) {
                const vertGradient = canvas.ctx.createLinearGradient(0, 0, 0, canvas.pickerHeight);
                props.verticalGradientPaint(vertGradient, currentPos.pos);
                canvas.ctx.fillStyle = vertGradient;
                canvas.ctx.fillRect(
                    canvas.circleRadiusPad, canvas.circleRadiusAddPad, canvas.pickerWidth, canvas.pickerHeight
                );
            }
        }
        if (props.dimension === "width") {
            if (props.horizontalGradientPaint) {
                const horzGradient = canvas.ctx.createLinearGradient(0, 0, canvas.pickerWidth, 0);
                props.horizontalGradientPaint(horzGradient, currentPos.pos);
                canvas.ctx.fillStyle = horzGradient;
                canvas.ctx.fillRect(
                    canvas.circleRadiusAddPad, canvas.circleRadiusPad, canvas.pickerWidth, canvas.pickerHeight
                );
            }
        }
        if (props.dimension === "both") {
            if (props.verticalGradientPaint) {
                const vertGradient = canvas.ctx.createLinearGradient(0, 0, 0, canvas.pickerHeight);
                props.verticalGradientPaint(vertGradient, currentPos.pos);
                canvas.ctx.fillStyle = vertGradient;
                canvas.ctx.fillRect(
                    canvas.circleRadiusAddPad, canvas.circleRadiusAddPad, canvas.pickerWidth, canvas.pickerHeight
                );
            }
            if (props.horizontalGradientPaint) {
                const horzGradient = canvas.ctx.createLinearGradient(0, 0, canvas.pickerWidth, 0);
                props.horizontalGradientPaint(horzGradient, currentPos.pos);
                canvas.ctx.fillStyle = horzGradient;
                if (props.verticalGradientPaint) {
                    canvas.ctx.globalCompositeOperation = "color";
                    canvas.ctx.fillRect(
                        canvas.circleRadiusAddPad, canvas.circleRadiusAddPad, canvas.pickerWidth, canvas.pickerHeight
                    );
                    canvas.ctx.globalCompositeOperation = "source-over";
                } else {
                    canvas.ctx.fillRect(
                        canvas.circleRadiusAddPad, canvas.circleRadiusAddPad, canvas.pickerWidth, canvas.pickerHeight
                    );
                }
            }
        }
        
        // Draw the circle
        let x = canvas.pickerWidth / 2;
        let y = canvas.pickerHeight / 2;
        if (props.dimension === "width" || props.dimension === "both") {
            x = currentPos.viewPos.x;
            if (props.dimension === "width") y = canvas.circleRadius;
        }
        if (props.dimension === "height" || props.dimension === "both") {
            y = currentPos.viewPos.y;
            if (props.dimension === "height") x = canvas.circleRadius;
        }

        canvas.ctx.beginPath();
        canvas.ctx.arc(x, y, canvas.actCircleRadius, 0, Math.PI * 2);
        if (props.pickerCircleOptions?.hasFill === undefined ?
            true : props.pickerCircleOptions.hasFill) {
            canvas.ctx.fillStyle = props.pickerCircleOptions?.fillStyle || defaultPickerCircleFillStyle;
            canvas.ctx.fill();
        }
        if (props.pickerCircleOptions?.hasStroke === undefined ?
            true : props.pickerCircleOptions.hasStroke) {
            canvas.ctx.strokeStyle = props.pickerCircleOptions?.strokeStyle || defaultPickerCircleStrokeStyle;
            canvas.ctx.stroke();
        }
        canvas.ctx.closePath();

        if (props.additionalPaint) {
            props.additionalPaint(canvas, currentPos.pos);
        }
    };

    createEffect(() => {
        updateCanvas();
    });

    const convertPosToViewPos = (
        pos: number,
        range: number,
        max: number,
        min: number,
        reverse: boolean,
        radiusAddPad: number,
    ): number => {
        const rate = (pos - min) / (max - min);
        let newNum: number;
        if (reverse) {
            newNum = ((1 - rate) * range) + radiusAddPad;
        } else {
            newNum = (rate * range) + radiusAddPad;
        }
        return Math.max(radiusAddPad, Math.min(range + radiusAddPad, newNum));
    }

    const convertViewPosToPos = (
        viewPos: number,
        range: number,
        max: number,
        min: number,
        reverse: boolean,
        precision: number,
    ): number => {
        const rate = viewPos / range;
        const posRange = max - min;
        let newNum: number;
        if (reverse) {
            newNum = (1 - rate) * posRange + min;
        } else {
            newNum = rate * posRange + min;
        }
        newNum = fixFloatingPoint(newNum, 10 ** precision) / 10 ** precision;
        return Math.max(min, Math.min(max, newNum));
    };

    const handleMouseEvents = (event: MouseEvent, canvas: CanvasAttr) => {
        let newX: number | undefined, newY: number | undefined;
        let viewX: number | undefined, viewY: number | undefined;
        if (props.dimension === "width" || props.dimension === "both") {
            const minViewX = canvas.circleRadiusAddPad;
            const maxViewX = canvas.pickerWidth + canvas.circleRadiusAddPad;
            viewX = (event.clientX - (canvas.left));
            viewX = Math.max(minViewX, Math.min(maxViewX, viewX));
            newX = convertViewPosToPos(
                viewX - canvas.circleRadiusAddPad, canvas.pickerWidth, 
                props.xMax || defaultMax, props.xMin || defaultMin,
                props.xDirection === "left", props.xPrecision || defaultPrecision
            );
        }
        if (props.dimension === "height" || props.dimension === "both") {
            const minViewY = canvas.circleRadiusAddPad;
            const maxViewY = canvas.pickerHeight + canvas.circleRadiusAddPad;
            viewY = (event.clientY - (canvas.top));
            viewY = Math.max(minViewY, Math.min(maxViewY, viewY));
            newY = convertViewPosToPos(
                viewY - canvas.circleRadiusAddPad, canvas.pickerHeight,
                props.yMax || defaultMax, props.yMin || defaultMin,
                props.yDirection === "top", props.yPrecision || defaultPrecision
            );
        }
        if (newX !== undefined || newY !== undefined) {
            setPos(prev => {
                if (prev.pos.x === newX && prev.pos.y === newY) return prev;
                return {
                    pos: { 
                        x: newX !== undefined ? newX : prev.pos.x,
                        y: newY !== undefined ? newY : prev.pos.y,
                    },
                    viewPos: {
                        x: viewX !== undefined ? viewX : prev.viewPos.x,
                        y: viewY !== undefined ? viewY : prev.viewPos.y,
                    },
                    from: "internal",
                };
            });
        }
    };

    const handleCanvasMouseDown = (event: MouseEvent) => {
        setCanvasDragging(true);
        const canvas = getOrCreateSetCanvasAttr("mouseDown");
        if (!canvas) return;
        handleMouseEvents(event, canvas);
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (canvasDragging()) {
            const canvas = getOrCreateSetCanvasAttr("mouseMove");
            if (!canvas) return;
            handleMouseEvents(event, canvas);
        }
    };

    const handleMouseUp = () => {
        setCanvasDragging(false);
    };

    onMount(() => {
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mousemove", handleMouseMove);
    });

    onCleanup(() => {
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mousemove", handleMouseMove);
    });

    return (
        <canvas 
            ref={canvasRef}
            height={props.height}
            width={props.width}
            onMouseDown={handleCanvasMouseDown}
        />
    )
}