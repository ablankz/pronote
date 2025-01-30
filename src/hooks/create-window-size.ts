import { createEffect, createSignal, onCleanup } from "solid-js";

export function createWindowSize() {
    const [width, setWidth] = createSignal(window.innerWidth);
    const [height, setHeight] = createSignal(window.innerHeight);

    const updateSize = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    };

    createEffect(() => window.addEventListener("resize", updateSize));
    onCleanup(() => window.removeEventListener("resize", updateSize));

    return { width, height };
}