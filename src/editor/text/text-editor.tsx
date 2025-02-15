import { 
  Component, 
  createSignal, 
} from "solid-js";
import { 
  FlexibleText, 
} from "../../renderer/text/types";
import FlexibleTextRenderer from "../../renderer/text/text-renderer";
import { editableTextBlock } from "./hooks/use-text-block";

interface FlexibleTextEditorProps {
    textZoneId: string;
    class?: string;
    classList?: Record<string, boolean>;
    defaultBlock: FlexibleText[];
    onUpdate: (block: FlexibleText[]) => void;
    editable?: boolean;
    letterSpacing?: number;
    lineHeight?: number;
    padding?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
}

const FlexibleTextEditor : Component<FlexibleTextEditorProps> = (props) => {
    const [textBlock, setTextBlock] = createSignal<FlexibleText[]>([
      ...props.defaultBlock,
    ]);
    
    return (
        <div
            class={`${props.class || ""}`}
            classList={{
                ...(props.classList || {}),
            }}
            style={{
                "min-height": "1em",
                "margin": "0",
                "padding": `${props.padding?.top || 0}px ${props.padding?.right || 0}px ${props.padding?.bottom || 0}px ${props.padding?.left || 0}px`,
                "line-height": `${props.lineHeight || 1.5}`,
                "letter-spacing": `${props.letterSpacing || 0}px`,
            }}
            use:editableTextBlock={{
              textZoneId: () => props.textZoneId,
              textBlock: [textBlock, setTextBlock],
            }}
            contenteditable={props.editable}
          >
              <FlexibleTextRenderer
                textBlock={textBlock()}
              />
        </div>
    );
  };
  
  export default FlexibleTextEditor;