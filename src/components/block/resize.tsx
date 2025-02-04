import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Setter, Show } from "solid-js";
import { Check } from "lucide-solid";
import { fixFloatingPoint } from "../../utils/calc";
import { safeConvertSizeUnit } from "../../utils/size";
import { globalCursorAction } from "../../store/action";
import { SIZE_UNITS, SizeValue } from "../../types/size";
import { maxPercentage, minPercentage, minPx, percentagePrecision, pxPrecision } from "../../consts/size";

interface ResizeModalProps {
    class?: string;
    width: SizeValue;
    height: SizeValue;
    setWidth: Setter<SizeValue>
    setHeight: Setter<SizeValue>
    setModal: Setter<boolean>;
    parentRef: HTMLElement;
    isRootBlock: boolean;
}

export default function ResizeModal(props: ResizeModalProps) {
    const [widthError, setWidthError] = createSignal("");
    const [heightError, setHeightError] = createSignal("");
    const [inputWidthDiff, setInputWidthDiff] = createSignal("");
    const [inputHeightDiff, setInputHeightDiff] = createSignal("");
    const [widthUnitOpen, setWidthUnitOpen] = createSignal(false);
    const [heightUnitOpen, setHeightUnitOpen] = createSignal(false);

    let modalRef: HTMLDivElement | undefined;
    let widthInput: HTMLInputElement | undefined;
    let heightInput: HTMLInputElement | undefined;
    let widthUnitModal: HTMLDivElement | undefined;
    let heightUnitModal: HTMLDivElement | undefined;

    createEffect(() => {
        widthInput && (widthInput.value = props.width.value.toString() + inputWidthDiff());
    });

    createEffect(() => {
        heightInput && (heightInput.value = props.height.value.toString() + inputHeightDiff());
    });

    const handleClickOutside = (event: MouseEvent) => {
        if (globalCursorAction()) return;

        if (widthUnitOpen() && !widthUnitModal?.contains(event.target as Node)) {
            setWidthUnitOpen(false);
        } else if (heightUnitOpen() && !heightUnitModal?.contains(event.target as Node)) {
            setHeightUnitOpen(false);
        }else if (modalRef && !modalRef.contains(event.target as Node)) {
            props.setModal(false);
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (globalCursorAction()) return;

        if (event.key === "Escape") {
            if (widthUnitOpen()) {
                setWidthUnitOpen(false);
            } else if (heightUnitOpen()) {
                setHeightUnitOpen(false);
            } else {
                props.setModal(false);
            }
        }
    };

    onMount(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
    });

    onCleanup(() => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
    });

    const totalClasses = createMemo(() => {
        return `absolute top-8 right-2 w-52 bg-white border-1 border-green-300 shadow-lg p-4 rounded z-40 ${props.class}`;
    });

    const handleWidthChange = (e: Event) => {
        e.preventDefault();
        let rawVal = (e.target as HTMLInputElement).value;
        if (rawVal === "") {
            setWidthError("Width is required");
            return;
        } else if (isNaN(Number(rawVal))) {
            setWidthError("Width must be a number");
            return;
        }
        let value, rawStr, dotIndex;
        switch (props.width.unit) {
            case "%":
                value = fixFloatingPoint(Number(rawVal), 10 ** percentagePrecision) / 10 ** percentagePrecision;
                if (value < minPercentage || value > maxPercentage) {
                    setWidthError(`Width must be between ${minPercentage}% and ${maxPercentage}%`);
                    return;
                }
                dotIndex = rawVal.indexOf(".");
                rawStr = dotIndex === -1 ? rawVal : rawVal.substring(0, dotIndex + percentagePrecision + 1);
                break;
            case "px":
                value = fixFloatingPoint(Number(rawVal), 10 ** pxPrecision) / 10 ** pxPrecision;
                if (value < minPx || value > props.parentRef.getBoundingClientRect().width) {
                    setWidthError(`Width must be between ${minPx}px and ${props.parentRef.getBoundingClientRect().width}px`);
                    return;
                }
                dotIndex = rawVal.indexOf(".");
                rawStr = dotIndex === -1 ? rawVal : rawVal.substring(0, dotIndex + pxPrecision + 1);
                break;
        }
        const diffRaw = rawStr.substring(value.toString().length);
        setInputWidthDiff(diffRaw);
        setWidthError("");
        props.setWidth(prev => {
            return {
                ...prev,
                value: value
            }
        });
      };
    
        const handleHeightChange = (e: Event) => {
            e.preventDefault();
            const rawVal = (e.target as HTMLInputElement).value;
            if (rawVal === "") {
                setHeightError("Height is required");
                return;
            } else if (isNaN(Number(rawVal))) {
                setHeightError("Height must be a number");
                return;
            }
            let value, rawStr, dotIndex;
            switch (props.height.unit) {
                case "%":
                    value = fixFloatingPoint(Number(rawVal), 10 ** percentagePrecision) / 10 ** percentagePrecision;
                    if (value < minPercentage || value > maxPercentage) {
                    setHeightError(`Height must be between ${minPercentage}% and ${maxPercentage}%`);
                    return;
                    }
                    dotIndex = rawVal.indexOf(".");
                    rawStr = dotIndex === -1 ? rawVal : rawVal.substring(0, dotIndex + percentagePrecision + 1);
                    break;
                case "px":
                    value = fixFloatingPoint(Number(rawVal), 10 ** pxPrecision) / 10 ** pxPrecision;
                    if ((value < minPx) || (!props.isRootBlock && value > props.parentRef.getBoundingClientRect().height)) {
                    setHeightError(`Height must be between ${minPx}px and ${props.parentRef.getBoundingClientRect().height}px`);
                    return;
                    }
                    dotIndex = rawVal.indexOf(".");
                    rawStr = dotIndex === -1 ? rawVal : rawVal.substring(0, dotIndex + pxPrecision + 1);
                    break;
            }
            const diffRaw = rawStr.substring(value.toString().length);
            setInputHeightDiff(diffRaw);
            setHeightError("");
            props.setHeight(prev => {
                return {
                    ...prev,
                    value: value
                }
            });
        };

    return (
            <div class={totalClasses()} ref={modalRef} 
            classList={{
                "cursor-auto": !globalCursorAction(),
            }}>
                <div class="relative flex items-center justify-between flex-col">
                    <div class="flex items-center max-w-[18rem] mx-auto mb-2">
                        <div class="relative w-full">
                            <div class="absolute inset-y-0 start-0 top-0 flex items-center ps-1 pointer-events-none">
                                <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="6" y1="14" x2="30" y2="14" stroke="black" stroke-width="2"/>
                                    <polygon points="30,12 34,14 30,16" fill="black"/>
                                    <polygon points="6,12 2,14 6,16" fill="black"/>
                                    <text x="4" y="28" font-size="10" fill="black">Width</text>
                                </svg>
                            </div>
                            <input 
                                class="block p-2.5 w-full ps-12 text-sm text-gray-900 bg-gray-50 rounded-s-lg border-e-gray-50 border-e-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500" 
                                ref={widthInput}
                                type="text"
                                onInput={handleWidthChange}
                            />
                        </div>
                        <div
                            class="relative shrink-0 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-e-lg focus:ring-4 focus:outline-none focus:ring-gray-100"
                            classList={{
                                "cursor-pointer hover:bg-gray-200": !globalCursorAction(),
                            }}
                            onClick={() => {
                                if (globalCursorAction()) return;
                                setWidthUnitOpen(prev => !prev)}
                            }
                        >
                            {props.width.unit}
                            <svg class="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/></svg>
                        </div>
                    </div>

                    <Show when={widthUnitOpen()}>
                        <div class="absolute z-20 top-10 right-0 bg-gray-200 divide-y divide-gray-100 rounded-lg w-16 shadow-emerald-200 shadow-sm" ref={widthUnitModal}>
                            <ul class="py-2 text-sm text-gray-700">
                                <For each={SIZE_UNITS}>
                                    {unit => (
                                        <li>
                                            <div 
                                            class="inline-flex w-full px-4 py-2 text-sm text-gray-700"
                                            role="menuitem"
                                            classList={{
                                                "bg-gray-300": props.width.unit === unit,
                                                "cursor-pointer hover:bg-gray-100": (props.width.unit !== unit) && !globalCursorAction(),
                                            }}
                                            onClick={() => {
                                                if (props.width.unit === unit || globalCursorAction()) return;
                                                const parentSize = props.parentRef.getBoundingClientRect().width;
                                                const computedStyle = window.getComputedStyle(props.parentRef);
                                                const paddingLeft = parseFloat(computedStyle.paddingLeft);
                                                const paddingRight = parseFloat(computedStyle.paddingRight);
                                                const newValue = safeConvertSizeUnit(props.width.value, props.width.unit, unit, parentSize - paddingLeft - paddingRight);
                                                props.setWidth(prev => {
                                                    return {
                                                        ...prev,
                                                        value: newValue,
                                                        unit: unit
                                                    }
                                                });
                                                setWidthUnitOpen(false);
                                            }}
                                            >
                                                <div class="w-full inline-flex items-center space-x-2 justify-end">
                                                    <Show when={props.width.unit === unit}>
                                                        <Check size={28} class="text-green-500" />
                                                    </Show>
                                                    <span>{unit}</span>
                                                </div>
                                            </div>
                                        </li>
                                    )}
                                </For>
                            </ul>
                        </div>
                    </Show>
                    {widthError() && <p class="text-red-500 text-xs mt-0.5 mb-1">{widthError()}</p>}
                    <label class="inline-flex items-center mb-5"
                        classList={{
                            "cursor-pointer": !globalCursorAction(),
                        }}
                    >
                    <input 
                        type="checkbox" 
                        class="sr-only peer" 
                        checked={props.width.auto}
                        onChange={() => props.setWidth(prev => {
                            return {
                                ...prev,
                                auto: !prev.auto
                            }
                        })}
                    />
                    <div class="relative w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-300" />
                    <span class="ms-3 text-sm font-medium text-gray-900">Width Auto</span>
                    </label>
                </div>

                <div class="relative flex items-center justify-between flex-col">

                <div class="flex items-center max-w-[18rem] mx-auto mb-2">
                    <div class="relative w-full">
                        <div class="absolute inset-y-0 start-0 top-0 flex items-center ps-1 pointer-events-none">
                        <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                            <line x1="18" y1="6" x2="18" y2="18" stroke="black" stroke-width="2"/>
                            <polygon points="16,6 18,2 20,6" fill="black"/>
                            <polygon points="16,18 18,22 20,18" fill="black"/>
                            <text x="2" y="32" font-size="10" fill="black">Height</text>
                        </svg>
                        </div>
                        <input 
                        class="block p-2.5 w-full ps-12 text-sm text-gray-900 bg-gray-50 rounded-s-lg border-e-gray-50 border-e-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500" 
                        ref={heightInput}
                        type="text"
                        onInput={handleHeightChange}
                        />
                    </div>
                    <div 
                    class="relative shrink-0 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-e-lg focus:ring-4 focus:outline-none focus:ring-gray-100"
                    classList={{
                        "cursor-pointer hover:bg-gray-200": !globalCursorAction(),
                    }}
                    onClick={() => {
                        if (globalCursorAction()) return;
                        setHeightUnitOpen(prev => !prev)
                    }}
                    >
                        {props.height.unit}
                        <svg class="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/></svg>
                    </div>
                </div>

                <Show when={heightUnitOpen()}>
                    <div class="absolute top-10 z-20 right-0 bg-gray-200 divide-y divide-gray-100 rounded-lg w-16 shadow-emerald-200 shadow-sm" ref={heightUnitModal}>
                        <ul class="py-2 text-sm text-gray-700">
                            <For each={SIZE_UNITS}>
                                {unit => (
                                    <li>
                                        <div 
                                        class="inline-flex w-full px-4 py-2 text-sm text-gray-700"
                                        role="menuitem"
                                        classList={{
                                            "bg-gray-300": props.height.unit === unit,
                                            "cursor-pointer hover:bg-gray-100": (props.height.unit !== unit) && !globalCursorAction(),
                                        }}
                                        onClick={() => {
                                            if (props.height.unit === unit || globalCursorAction()) return;
                                            const parentSize = props.parentRef.getBoundingClientRect().height;
                                            const computedStyle = window.getComputedStyle(props.parentRef);
                                            const paddingTop = parseFloat(computedStyle.paddingTop);
                                            const paddingBottom = parseFloat(computedStyle.paddingBottom);
                                            const newValue = safeConvertSizeUnit(props.height.value, props.height.unit, unit, parentSize - paddingTop - paddingBottom);
                                            props.setHeight(prev => {
                                                return {
                                                    ...prev,
                                                    value: newValue,
                                                    unit: unit
                                                }
                                            });
                                            setHeightUnitOpen(false);
                                        }}
                                        >
                                            <div class="w-full inline-flex items-center space-x-2 justify-end">
                                                <Show when={props.height.unit === unit}>
                                                    <Check size={28} class="text-green-500" />
                                                </Show>
                                                <span>{unit}</span>
                                            </div>
                                        </div>
                                    </li>
                                )}
                            </For>
                        </ul>
                    </div>
                </Show>
                {heightError() && <p class="text-red-500 text-xs mt-0.5 mb-1">{heightError()}</p>}
                <label class="inline-flex items-center mb-5"
                classList={{
                    "cursor-pointer": !globalCursorAction(),
                }}>
                <input 
                type="checkbox" 
                class="sr-only peer" 
                checked={props.height.auto}
                onChange={() => props.setHeight(prev => {
                    return {
                        ...prev,
                        auto: !prev.auto
                    }
                })}
                />
                <div class="relative w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-300" />
                <span class="ms-3 text-sm font-medium text-gray-900">Height Auto</span>
                </label>
                </div>

                <div
                    class="w-full bg-green-500 text-white py-1 mt-2 rounded text-center"
                    classList={{
                        "cursor-pointer hover:bg-green-600": !globalCursorAction(),
                    }}
                    onClick={() => {
                        if (globalCursorAction()) return;
                        props.setModal(false)
                    }}
                >
                    Close
                </div>
            </div>
    );
}