import { createSignal, For, onCleanup } from "solid-js";

export default function DragAndDrop() {
  const [items, setItems] = createSignal(["Button", "Input", "Card", "Modal", "Dropdown"]);
  const [draggingItem, setDraggingItem] = createSignal<string | null>(null);
  const [mouseX, setMouseX] = createSignal(0);
  const [mouseY, setMouseY] = createSignal(0);
  const [isDragging, setIsDragging] = createSignal(false);

  let containerRef: HTMLDivElement | undefined;
  let dragElementRef: HTMLDivElement | undefined;

   // マウス移動時に位置を更新
  const updateMousePosition = (event: MouseEvent) => {
    if (!containerRef || !isDragging()) return;

    const rect = containerRef.getBoundingClientRect();
    setMouseX(event.clientX - rect.left);
    setMouseY(event.clientY - rect.top);
  };

  // ドラッグ開始（MouseDown）
  const handleMouseDown = (event: MouseEvent, item: string) => {
    setDraggingItem(item);
    setIsDragging(true);

    const rect = containerRef?.getBoundingClientRect();
    rect && setMouseX(event.clientX - rect.left) && setMouseY(event.clientY - rect.top);
    document.body.style.cursor = "move";

    document.addEventListener("mousemove", updateMousePosition);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // ドラッグ終了（MouseUp）
  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingItem(null);
    document.body.style.cursor = "auto";

    document.removeEventListener("mousemove", updateMousePosition);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  onCleanup(() => {
    document.body.style.cursor = "auto";
    document.removeEventListener("mousemove", updateMousePosition);
    document.removeEventListener("mouseup", handleMouseUp);
  });

  return (
    <div ref={containerRef} class="relative w-96 p-6 bg-gray-100 rounded-lg shadow-lg min-h-screen">
      {/* 保持コンポーネントリスト */}
      <h2 class="text-lg font-semibold mb-2">📦 保持コンポーネント</h2>
      <For each={items()}>
        {(item, index) => (
          <div
            onMouseDown={(e) => handleMouseDown(e, item)}
            class="p-2 mb-2 bg-white rounded cursor-move border border-gray-300 flex items-center justify-between transition select-none"
          >
            <span>{item}</span>
            <span class="text-xs text-gray-500">#{index() + 1}</span>
          </div>
        )}
      </For>

      {/* ドラッグ中の要素を表示 */}
      {isDragging() && draggingItem() && (
        <div
          ref={dragElementRef}
          class="absolute bg-blue-500 text-white px-4 py-2 rounded shadow-lg pointer-events-none transition-transform"
          style={{
            left: `${mouseX()}px`,
            top: `${mouseY()}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {draggingItem()}
        </div>
      )}
    </div>
  );
}
