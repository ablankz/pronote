import { JSXElement } from "solid-js";

export interface StyleButtonProps {
    class?: string;
    classList?: Record<string, boolean>;
    Icon: JSXElement;
    onClick: (e: MouseEvent) => void;
}

const StyleButton = (props: StyleButtonProps) => {
    return (
        <div
            onClick={props.onClick}
            class={`relative ${props.class}`}
            classList={{
                ...(props.classList || {}),
                }}
        >
            {props.Icon}
        </div>   
    );
};

export default StyleButton;
