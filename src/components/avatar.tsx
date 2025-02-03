import { createMemo } from "solid-js";
import { generateColor, generateInitials } from "../utils/generate";
import { globalCursorAction } from "../store/action";

interface ProfileAvatarProps {
    name: string;
    src?: string;
    size?: string;
    class?: string;
}

export default function ProfileAvatar(props: ProfileAvatarProps) {
    const initials = createMemo(() => generateInitials(props.name));
    const bgColor = createMemo(() => generateColor(props.name));

    const totalClasses = createMemo(() => {
        let classes = "rounded-full flex items-center justify-center text-white font-bold";
        if (props.class) classes += ` ${props.class}`;
        return classes;
    });

    return (
        <div
        class={totalClasses()}
        classList={{
            "cursor-pointer": !globalCursorAction(),
        }}
        style={{
            width: props.size || "40px",
            height: props.size || "40px",
            background: props.src ? `url(${props.src}) center/cover` : "",
        }}
        >
        {!props.src && <div class={`w-full h-full flex items-center justify-center ${bgColor()} rounded-full`}>{initials()}</div>}
        </div>
    );
}