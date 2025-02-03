import { batch, createSignal } from "solid-js";
import { ReceiptText, X } from "lucide-solid";
import { BlockDetailValue, ComponentBlock } from "./type";

interface BlockContentProps {
    class?: string;
    classList?: Record<string, boolean>;
    component: ComponentBlock | null;
}

export default function BlockContent(props: BlockContentProps) {
  let componentRef: HTMLDivElement | undefined;

  return (
    <div
        class={`p-0.5 ${props.class || ""}`}
        ref={componentRef}
        classList={{
        ...(props.classList || {}),
        }}
    >
        <div class="flex justify-between items-center">
            <div class="flex items-center">
                <div class="ml-2 text-xl">
                    <span class="font-bold">
                        {props.component?.id}
                    </span>
                </div>
            </div>
            </div>
    </div>
  );
}