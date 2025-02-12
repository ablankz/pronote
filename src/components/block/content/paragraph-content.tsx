import { TextZonePrefixes } from "../../../renderer/text/id";
import { FlexibleText } from "../../../types/text";
import FlexibleTextRenderer from "../../../renderer/text/text-renderer";

interface ParagraphContentProps {
    componentId: string;
    class?: string;
    classList?: Record<string, boolean>;
    data: any;
}

export default function ParagraphContent(props: ParagraphContentProps) {

  const sampleTextBlock: FlexibleText[] = [
    // { id: crypto.randomUUID(), type: FlexibleTextTypes.TEXT, version: 0, text: "Hi!\n", bold: false, italic: true, underline: true, strikeThrough: false, color: "red", fontSize: 38, fontFamily: "Times New Roman" },
    // { id: crypto.randomUUID(), type: FlexibleTextTypes.TEXT, version: 0, text: "Hello ", bold: true, italic: false, underline: false, strikeThrough: false, color: "black", fontSize: 16, fontFamily: "Arial" },
    // { id: crypto.randomUUID(), type: FlexibleTextTypes.TEXT, version: 0, text: "World!\n", bold: false, italic: true, underline: true, strikeThrough: false, color: "red", fontSize: 28, fontFamily: "Times New Roman" },
    // { id: crypto.randomUUID(), type: FlexibleTextTypes.TEXT, version: 0, text: "This is a test.\n", bold: false, italic: false, underline: false, strikeThrough: true, color: "blue", fontSize: 14, fontFamily: "Verdana" },
  ];

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
      <FlexibleTextRenderer 
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