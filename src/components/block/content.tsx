import { Match, Switch } from "solid-js";
import { BlockTypes, ComponentBlock } from "../../renderer/types";
import ParagraphContent from "./content/paragraph-content";

interface BlockContentProps {
    class?: string;
    classList?: Record<string, boolean>;
    component: ComponentBlock | null;
}

export default function BlockContent(props: BlockContentProps) {
  let componentRef: HTMLDivElement | undefined;

  return (
    <div
        class={`p-0.5 w-full ${props.class || ""}`}
        ref={componentRef}
        classList={{
        ...(props.classList || {}),
        }}
    >
        <Switch>
            <Match when={props.component?.type === BlockTypes.PARAGRAPH}>
                <ParagraphContent data={props.component?.data} componentId={props.component?.id || ""} />
            </Match>
        </Switch>
    </div>
  );
}