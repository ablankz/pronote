interface ParagraphContentProps {
    class?: string;
    classList?: Record<string, boolean>;
    data: any;
}

export default function ParagraphContent(props: ParagraphContentProps) {

  return (
    <div
        class={`${props.class || ""}`}
        classList={{
        ...(props.classList || {}),
        }}
    >
      paragraph
    </div>
  );
}