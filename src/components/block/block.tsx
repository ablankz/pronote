import { batch, createMemo, createSignal, Setter, Show } from "solid-js";
import { Trash, Scaling, SquareSplitVertical, SquareSplitHorizontal, Type } from "lucide-solid";
import { ResizeBlockProps, SizeValue } from "./type";
import { heightInitialSizeValue, maxPercentage, minPercentage, minPx, percentagePrecision, pxPrecision, widthInitialSizeValue } from "./const";
import ResizeModal from "./resize";
import { fixFloatingPoint } from "../../utils/calc";
import { convertToPercentage } from "../../utils/size";

interface BlockProps {
  id: string;
  isResizing: ResizeBlockProps;
  setIsResizing: Setter<ResizeBlockProps>;
  isSelected: boolean;
  setSelected: Setter<string>;
}

export default function Block(props: BlockProps) {
  const [isBlockHovered, setIsBlockHovered] = createSignal(false);
  const [showResizeModal, setShowResizeModal] = createSignal(false);
  const [showSplitPreview, setShowSplitPreview] = createSignal(false);
  const [splitDirection, setSplitDirection] = createSignal<"vertical" | "horizontal">("vertical");
  const [width, setWidth] = createSignal<SizeValue>(widthInitialSizeValue);
  const [height, setHeight] = createSignal<SizeValue> (heightInitialSizeValue);
  const [isLocalResizing, setIsLocalResizing] = createSignal(false);
  const [resizeDirection, setResizeDirection] = createSignal<"right" | "bottom" | "corner" | null>(null);
  const [mouseStartX, setMouseStartX] = createSignal(0);
  const [mouseStartY, setMouseStartY] = createSignal(0);
  const [initialWidth, setInitialWidth] = createSignal(0);
  const [initialHeight, setInitialHeight] = createSignal(0);

  let componentRef: HTMLDivElement | undefined;

  const isFocused = createMemo(() => {
    return isLocalResizing() || showResizeModal() || isBlockHovered() || props.isSelected;
  });

  const handleMouseDown = (direction: "right" | "bottom" | "corner") => (e: MouseEvent) => {
    e.preventDefault();

    batch(() => {
      setIsLocalResizing(true);
      props.setIsResizing({ resizing: true, resizerId: props.id, direction });
      setResizeDirection(direction);
      setMouseStartX(e.clientX);
      setMouseStartY(e.clientY);
      if ((direction === "right" || direction === "corner") && width().auto) {
        const currentWidth = componentRef?.getBoundingClientRect().width!;
        switch (width().unit) {
          case "%":
            const parentSize = componentRef?.parentElement?.getBoundingClientRect().width!;
            const computedStyle = window.getComputedStyle(componentRef?.parentElement!);
            const paddingLeft = parseFloat(computedStyle.paddingLeft);
            const paddingRight = parseFloat(computedStyle.paddingRight);
            const newVal = convertToPercentage(currentWidth, "px", parentSize - paddingLeft - paddingRight);
            setWidth(prev => ({ ...prev, auto: false, value: newVal }));
            setInitialWidth(newVal);
            break;
          case "px":
            setWidth(prev => ({ ...prev, auto: false, value: currentWidth }));
            setInitialWidth(currentWidth);
            break;
        }
      }else{
        setInitialWidth(width().value);
      }
      if ((direction === "bottom" || direction === "corner") && height().auto) {
        const currentHeight = componentRef?.getBoundingClientRect().height!;
        switch (height().unit) {
          case "%":
            const parentSize = componentRef?.parentElement?.getBoundingClientRect().height!;
            const computedStyle = window.getComputedStyle(componentRef?.parentElement!);
            const paddingTop = parseFloat(computedStyle.paddingTop);
            const paddingBottom = parseFloat(computedStyle.paddingBottom);
            const newVal = convertToPercentage(currentHeight, "px", parentSize - paddingTop - paddingBottom);
            setHeight(prev => ({ ...prev, auto: false, value: newVal }));
            setInitialHeight(newVal);
            break;
          case "px":
            setHeight(prev => ({ ...prev, auto: false, value: currentHeight }));
            setInitialHeight(currentHeight);
            break;
        }
      }else{
        setInitialHeight(height().value);
      }
    });

    switch (direction) {
      case "right":
        document.body.style.cursor = "ew-resize";
        break;
      case "bottom":
        document.body.style.cursor = "ns-resize";
        break;
      case "corner":
        document.body.style.cursor = "nwse-resize";
        break;
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isLocalResizing()) return;

      const deltaX = moveEvent.clientX - mouseStartX();
      const deltaY = moveEvent.clientY - mouseStartY();

      requestAnimationFrame(() => {
        if (resizeDirection() === "right" || resizeDirection() === "corner") {
          let newWidth;
          switch (width().unit) {
            case "%":
              newWidth = initialWidth() + (deltaX / window.innerWidth) * 100;
              break;
            case "px":
              newWidth = initialWidth() + deltaX;
              break;
          }
          let value: number;
          switch (width().unit) {
            case "%":
              value = fixFloatingPoint(newWidth, 10 ** percentagePrecision) / 10 ** percentagePrecision;
              if (newWidth >= minPercentage && newWidth <= maxPercentage) setWidth(prev => ({ ...prev, value: value }));
              break;
            case "px":
              value = fixFloatingPoint(newWidth, 10 ** pxPrecision) / 10 ** pxPrecision;
              if (newWidth >= minPx) setWidth(prev => ({ ...prev, value: value }));
              break;
          }
        }

        if (resizeDirection() === "bottom" || resizeDirection() === "corner") {
          let newHeight;
          switch (height().unit) {
            case "%":
              newHeight = initialHeight() + (deltaY / window.innerHeight) * 100;
              break;
            case "px":
              newHeight = initialHeight() + deltaY;
              break;
          }
          let value: number;
          switch (height().unit) {
            case "%":
              value = fixFloatingPoint(newHeight, 10 ** percentagePrecision) / 10 ** percentagePrecision;
              if (newHeight >= minPercentage && newHeight <= maxPercentage) setHeight(prev => ({ ...prev, value: value }));
              break;
            case "px":
              value = fixFloatingPoint(newHeight, 10 ** pxPrecision) / 10 ** pxPrecision;
              if (newHeight >= minPx) setHeight(prev => ({ ...prev, value: value }));
              break;
          }
        }
      });
    };

    const handleMouseUp = () => {
      setIsLocalResizing(false);
      if(props.isResizing.resizing && props.isResizing.resizerId === props.id) {
        props.setIsResizing({ resizing: false, resizerId: "", direction: "right" });
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "auto";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      class="relative rounded-md p-4 bg-white block-component"
      ref={componentRef}
      style={{
        width: width().auto ? "auto" : `${width().value}${width().unit}`,
        "max-width": "100%", 
        height: height().auto ? "auto" : `${height().value}${height().unit}`,
        "max-height": "100%",
        transition: isLocalResizing() ? "none" : "width 0.2s, height 0.2s",
      }}
      classList={{
        "outline-double outline-sky-500 outline-4 outline-offset-4": isFocused(),
        "border border-gray-300": !isFocused(),
        "bg-indigo-500 shadow-xl shadow-indigo-500/50": props.isSelected,
      }}
      onMouseEnter={() => {
        setIsBlockHovered(true)
      }}
      onMouseLeave={() => {
        setIsBlockHovered(false);
      }}
      onClick={() => {
        props.setSelected(props.id);
      }}
    >
      <Show when={isFocused()}>
      <div class="absolute -top-2 -right-2 flex space-x-2 z-10">
        <button
          class="p-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setShowResizeModal(true)}
        >
          <Scaling size={16} />
        </button>

        <button
          class="p-1 bg-gray-200 rounded hover:bg-gray-300"
          onMouseEnter={() => {
            setShowSplitPreview(true);
            setSplitDirection("vertical");
          }}
          onMouseLeave={() => {
            setShowSplitPreview(false)
          }}
        >
          <SquareSplitVertical size={16} />
        </button>

        <button
          class="p-1 bg-gray-200 rounded hover:bg-gray-300"
          onMouseEnter={() => {
            setShowSplitPreview(true);
            setSplitDirection("horizontal");
          }}
          onMouseLeave={() => {
            setShowSplitPreview(false)
          }}
        >
          <SquareSplitHorizontal size={16} />
        </button>

        <button class="p-1 bg-gray-200 rounded hover:bg-gray-300">
          <Type size={16} />
        </button>

        <button class="p-1 bg-red-500 text-white rounded hover:bg-red-600">
          <Trash size={16} />
        </button>
      </div>
      </Show>

      <Show when={showSplitPreview()}>
        <div
          class={`absolute inset-0 border-dashed border-2 border-blue-400 opacity-50 pointer-events-none`}
          style={{
            display: splitDirection() === "vertical" ? "grid" : "flex",
            "grid-template-columns": splitDirection() === "horizontal" ? "1fr 1fr" : undefined,
            "flex-direction": splitDirection() === "horizontal" ? "row" : undefined,
          }}
        />
      </Show> 

      <Show when={showResizeModal()}>
        <ResizeModal
          width={width()}
          height={height()}
          setWidth={setWidth}
          setHeight={setHeight}
          setModal={setShowResizeModal}
          parentRef={componentRef?.parentElement!}
        />
      </Show>

        <div
          class="absolute left-0 top-0 w-full h-[15%] max-h-12 min-h-3 rounded-3xl
           hover:bg-white hover:bg-[radial-gradient(#e5e7eb_3.5px,transparent_3.5px)] hover:[background-size:12px_12px]"
          classList={{
            "cursor-move": !props.isResizing.resizing,
          }}
        />

        <div
          class="absolute right-0 top-0 w-2 h-full"
          onMouseDown={handleMouseDown("right")}
          classList={{
            "cursor-e-resize hover:bg-green-200": !props.isResizing.resizing,
            "bg-green-200": isLocalResizing() && resizeDirection() === "right"
          }}
        />

        <div
          class="absolute bottom-0 left-0 w-full h-2"
          onMouseDown={handleMouseDown("bottom")}
          classList={{
            "cursor-s-resize hover:bg-green-200": !props.isResizing.resizing,
            "bg-green-200": isLocalResizing() && resizeDirection() === "bottom"
          }}
        />

        <div
          class="absolute bottom-0 right-0 w-2 h-2"
          onMouseDown={handleMouseDown("corner")}
          classList={{
            "cursor-se-resize hover:bg-green-200": !props.isResizing.resizing,
            "bg-green-200": isLocalResizing() && resizeDirection() === "corner"
          }}
        />
    </div>
  );
}
