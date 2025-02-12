import { batch, createMemo, createSignal, Show } from "solid-js";
import { ReceiptText, X } from "lucide-solid";
import Scrollable from "../components/scrollable";
import { selectedBlock } from "../store/select";
import { fixFloatingPoint } from "../utils/calc";
import { detailOpen, globalCursorAction, setDetailOpen, setGlobalCursorAction } from "../store/action";
import { SizeValue } from "../types/size";
import { pxPrecision } from "../consts/size";
import { useAnimationShow } from "../hooks/use-animation-show";

interface DetailBarProps {
    class?: string;
    classList?: Record<string, boolean>;
    defaultWidth: number;
    minWidth: number;
    maxWidth: number;
}

export default function DetailBar(props: DetailBarProps) {
  const [isLocalResizing, setIsLocalResizing] = createSignal(false);
  const [resizeDirection, setResizeDirection] = createSignal<"left" | null>(null);
  const [width, setWidth] = createSignal<SizeValue>({
    auto: false,
    value: props.defaultWidth,
    unit: "px",
  });
  const [initialWidth, setInitialWidth] = createSignal(0);
  const [mouseStartX, setMouseStartX] = createSignal(0);
  const isOpen = createMemo(() => !!selectedBlock() && detailOpen());
  const { render, visible } = useAnimationShow(isOpen);

  let componentRef: HTMLDivElement | undefined;

  const handleMouseDown = (direction: "left") => (e: MouseEvent) => {
      e.preventDefault();

      if (globalCursorAction()) return;
  
      batch(() => {
        setIsLocalResizing(true);
        setResizeDirection(direction);
        setMouseStartX(e.clientX);
        setInitialWidth(width().value);
      });
  
      switch (direction) {
        case "left":
          document.body.style.cursor = "ew-resize";
          setGlobalCursorAction(true);
          break;
      }
  
      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isLocalResizing()) return;
  
        const deltaX = (mouseStartX() - moveEvent.clientX) * 1.2;
  
        requestAnimationFrame(() => {
          if (resizeDirection() === "left") {
            let newWidth;
            newWidth = initialWidth() + deltaX;
            let value: number;
            value = fixFloatingPoint(newWidth, 10 ** pxPrecision) / 10 ** pxPrecision;
            if (newWidth >= props.minWidth && newWidth <= props.maxWidth) {
              setWidth(prev => ({ ...prev, value: value }));
            }
          }
        });
      };
  
      const handleMouseUp = () => {
        if (!isLocalResizing()) return;

        setIsLocalResizing(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "auto";
        setGlobalCursorAction(false);
      };
  
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

  return (
    <Show when={render()}>
      <div
        class={`relative bg-gray-300 text-gray-600 transition-all duration-300 px-1.5 py-2 ${props.class || ""}`}
        ref={componentRef}
        classList={{
          ...(props.classList || {}),
        }}
        style={{
          transition: isLocalResizing() ? "none" : "width 0.2s, height 0.2s",
          width: visible() ? `${width().value}${width().unit}` : "0",
        }}
      >
        <div
          class="absolute top-3 right-3 z-[35] transition-opacity duration-200"
          onClick={() => setDetailOpen(false)}
          classList={{
              "cursor-pointer": !globalCursorAction(),
              "opacity-0": !isOpen(),
              "opacity-100": isOpen(),
          }}
        >
          <X size={24} />
        </div>

        <div
            class="absolute left-0 top-0 w-2 h-full z-[35] transition-opacity duration-200"
            onMouseDown={handleMouseDown("left")}
            classList={{
              "cursor-e-resize hover:bg-green-200": !globalCursorAction(),
              "bg-green-200": isLocalResizing() && resizeDirection() === "left",
              "opacity-0": !isOpen(),
              "opacity-100": isOpen(),
            }}
          />

          <div 
          class="absolute left-0 w-full top-0 z-20 bg-white shadow-md transition-opacity duration-200"
          classList={{
            "opacity-0": !isOpen(),
            "opacity-100": isOpen(),
          }}
          >
            <div class="flex items-center justify-center w-full my-2">
              <ReceiptText size={24} />
              <div class="ml-2 text-xl">
                <span class="font-bold">
                  {selectedBlock()?.component.type.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <div class="w-full h-[calc(100%-3rem)] mt-10">
            <Scrollable class="[&::-webkit-scrollbar]:w-1.5 w-full">
              <div class="w-full">
                  <div class="flex flex-col items-center mt-1 py-2">
                    <div class="w-full h-36 bg-amber-300"></div>
                    <div class="w-full h-36 bg-amber-300"></div>
                    <div class="w-full h-36 bg-amber-300"></div>
                    <div class="w-full h-36 bg-amber-300"></div>
                    <div class="w-full h-36 bg-amber-300"></div>
                    <div class="w-full h-36 bg-amber-300"></div>
                    <div class="w-full h-36 bg-amber-300"></div>
                  </div>
              </div>
            </Scrollable>
        </div>
      </div>
    </Show>
  );
}