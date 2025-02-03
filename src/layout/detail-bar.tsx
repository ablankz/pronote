import { batch, createSignal } from "solid-js";
import { ReceiptText, X } from "lucide-solid";
import Scrollable from "../components/scrollable";
import { BlockDetailValue, SizeValue } from "../components/block/type";
import { setDetailSelected } from "../store/select";
import { fixFloatingPoint } from "../utils/calc";
import { pxPrecision } from "../components/block/const";
import { globalCursorAction, setGlobalCursorAction } from "../store/action";

interface DetailBarProps {
    class: string;
    selectedComponent: BlockDetailValue | null;
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
    <div
      class={`relative bg-gray-300 text-gray-600 transition-all duration-300 px-1.5 py-2`}
      ref={componentRef}
      classList={{
        [props.class]: true,
      }}
      style={{
        width: !props.selectedComponent ? "0" : `${width().value}${width().unit}`,
        transition: isLocalResizing() ? "none" : "width 0.2s, height 0.2s",
      }}
    >
      <div
        class="absolute top-6 right-6 z-[35] transition-opacity duration-200"
        onClick={() => setDetailSelected(null)}
        classList={{
            "cursor-pointer": !globalCursorAction(),
            "opacity-0": !props.selectedComponent,
            "opacity-100": !!props.selectedComponent,
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
            "opacity-0": !props.selectedComponent,
            "opacity-100": !!props.selectedComponent,
          }}
        />

        <div 
        class="absolute left-0 w-full top-0 z-20 bg-white shadow-md transition-opacity duration-200"
        classList={{
          "opacity-0": !props.selectedComponent,
          "opacity-100": !!props.selectedComponent,
        }}
        >
          <div class="flex items-center justify-center w-full my-4">
            <ReceiptText size={28} />
            <div class="ml-2 text-2xl">
              <span class="font-bold">
                {props.selectedComponent?.component.type.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div class="w-full h-[calc(100%-4rem)] mt-16">
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
  );
}