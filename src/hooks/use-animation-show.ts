import { createSignal, createEffect, onCleanup, Accessor } from "solid-js";

export const useAnimationShow = (
    when: Accessor<boolean>,
    duration?: number,
) => {
    const [render, setRender] = createSignal(false);
    const [visible, setVisible] = createSignal(false);

    createEffect(() => {
        if (when()) {
            setRender(true);
            setTimeout(() => setVisible(true), 0);
        } else {
            setVisible(false);
            setTimeout(() => setRender(false), duration || 300);
        }
    });

    onCleanup(() => {
        setVisible(false);
        setRender(false);
    });

    return {
        render,
        visible,
    };
};