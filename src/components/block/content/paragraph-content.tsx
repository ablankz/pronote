import { FlexibleText } from "../../../types/text";
import FlexibleTextRenderer from "../../renderer/text-renderer";

interface ParagraphContentProps {
    class?: string;
    classList?: Record<string, boolean>;
    data: any;
}

export default function ParagraphContent(props: ParagraphContentProps) {

  const sampleTextBlock: FlexibleText[] = [
      { id: crypto.randomUUID(), version: 0, text: "Hello ", bold: true, italic: false, underline: false, strikeThrough: false, color: "black", fontSize: 16, fontFamily: "Arial" },
      { id: crypto.randomUUID(), version: 0, text: "World!\n", bold: false, italic: true, underline: true, strikeThrough: false, color: "red", fontSize: 18, fontFamily: "Times New Roman" },
      { id: crypto.randomUUID(), version: 0, text: "This is a test.", bold: false, italic: false, underline: false, strikeThrough: true, color: "blue", fontSize: 14, fontFamily: "Verdana" },
    ];

  return (
    <div
        class={`w-full ${props.class || "w-full"}`}
        classList={{
        ...(props.classList || {}),
        }}
    >
      <FlexibleTextRenderer 
        defaultBlock={sampleTextBlock}
        onUpdate={(block) => console.log(block)}
        editable={true}
        class="p-2 rounded-md break-words whitespace-pre-wrap max-w-full outline-0"
      />
    </div>
  );
}