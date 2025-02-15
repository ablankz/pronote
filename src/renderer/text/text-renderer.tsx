import { 
  Component,  
  createMemo, 
  For, 
  Match,  
  Switch, 
} from "solid-js";
import { 
  FlexibleText, 
} from "./types";
import { FlexibleTextTypes } from "./const";

interface FlexibleTextRendererProps {
    spanClass?: string;
    spanClassList?: Record<string, boolean>;
    spanStyle?: Record<string, string>;
    textBlock: FlexibleText[];
}

const FlexibleTextRenderer : Component<FlexibleTextRendererProps> = (props) => {
    const keys = createMemo(() => props.textBlock.map((el, i) => el.id + "[" + el.version + "]" + ":" + i));

    const map = createMemo(() => {
        const map = new Map<string, FlexibleText>();
        props.textBlock.forEach((item, i) => map.set(item.id + "[" + item.version + "]" + ":" + i, item));
        return map;
    });
    
    return (
        <>
              <For each={keys()}>
                {(key) => {
                  const chunk = map().get(key)!;
                  return (
                    <Switch>
                      <Match when={chunk.type === FlexibleTextTypes.TEXT}>
                        <span 
                          class={`${props.spanClass || ""}`}
                          classList={{
                            ...(props.spanClassList || {}),
                          }}
                          style={{
                            "font-weight": chunk.bold ? "bold" : "normal",
                            "font-style": chunk.italic ? "italic" : "normal",
                            "text-decoration": `${chunk.underline ? "underline" : ""} ${chunk.strikeThrough ? "line-through" : ""}`,
                            "color": chunk.fontColor || "inherit",
                            "background-color": chunk.highlightColor || "inherit",
                            "font-size": `${chunk.fontSize}px`,
                            "font-family": chunk.fontFamily || "inherit",
                            "vertical-align": chunk.verticalAlign || "baseline",
                            ...props.spanStyle,
                          }}
                          >
                          {chunk.text}
                        </span>
                      </Match>
                    </Switch>
                    
                  );
                }}
              </For>
        </>
    );
  };
  
  export default FlexibleTextRenderer;