import { TextZonePrefixes } from "../../../editor/text/id";
import FlexibleTextEditor from "../../../editor/text/text-editor";
import { FlexibleText } from "../../../renderer/text/types";

interface ParagraphContentProps {
    componentId: string;
    class?: string;
    classList?: Record<string, boolean>;
    data: any;
}

export default function ParagraphContent(props: ParagraphContentProps) {

  const sampleTextBlock: FlexibleText[] = [];

  const padding = {
    top: 2,
    bottom: 2,
    left: 2,
    right: 2,
  };

  return (
    <div
        class={`w-full ${props.class}`}
        classList={{
        ...(props.classList || {}),
        }}
    >
      <FlexibleTextEditor
        textZoneId={TextZonePrefixes.BLOCK_PARAGRAPH + props.componentId}
        defaultBlock={sampleTextBlock}
        onUpdate={(block) => console.log(block)}
        editable={true}
        class="rounded-md break-words whitespace-pre-wrap max-w-full outline-0"
        padding={padding}
        lineHeight={2}
        letterSpacing={5}
      />
    </div>
  );
}