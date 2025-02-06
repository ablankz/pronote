import { batch, createMemo, createSignal, Show } from "solid-js";
import { Trash, Scaling, SquareSplitVertical, SquareSplitHorizontal, ReceiptText } from "lucide-solid";
import ResizeModal from "./resize";
import { fixFloatingPoint } from "../../utils/calc";
import { convertToPercentage } from "../../utils/size";
import { setSelectedBlock } from "../../store/select";
import { globalCursorAction, setDetailOpen, setGlobalCursorAction } from "../../store/action";
import BlockContent from "./content";
import { ComponentBlock } from "../../types/block";
import { SizeValue } from "../../types/size";
import { maxPercentage, minPercentage, minPx, percentagePrecision, pxPrecision } from "../../consts/size";

interface BlockProps {
  component: ComponentBlock;
  isSelected: boolean;
  isRootBlock: boolean;
  handleDeleteBlock: (id: string) => void;
}

export default function Block(props: BlockProps) {
  const [isBlockHovered, setIsBlockHovered] = createSignal(false);
  const [showResizeModal, setShowResizeModal] = createSignal(false);
  const [showSplitPreview, setShowSplitPreview] = createSignal(false);
  const [splitDirection, setSplitDirection] = createSignal<"vertical" | "horizontal">("vertical");
  const [width, setWidth] = createSignal<SizeValue>(props.component.widthInitialSizeValue);
  const [height, setHeight] = createSignal<SizeValue> (props.component.heightInitialSizeValue);
  const [isLocalResizing, setIsLocalResizing] = createSignal(false);
  const [resizeDirection, setResizeDirection] = createSignal<"right" | "bottom" | "corner" | null>(null);
  const [mouseStartX, setMouseStartX] = createSignal(0);
  const [mouseStartY, setMouseStartY] = createSignal(0);
  const [initialWidth, setInitialWidth] = createSignal(0);
  const [initialHeight, setInitialHeight] = createSignal(0);
  const [dropTarget, setDropTarget] = createSignal(false);

  let componentRef: HTMLDivElement | undefined;

  const isFocused = createMemo(() => {
    return isLocalResizing() || showResizeModal() || isBlockHovered() || props.isSelected;
  });

  const handleDropMouseEnter = (e: MouseEvent) => {
    e.preventDefault();

    setDropTarget(true);
  };

  const handleDropMouseLeave = (e: MouseEvent) => {
    e.preventDefault();

    setDropTarget(false);
  };

  const handleMouseDown = (direction: "right" | "bottom" | "corner") => (e: MouseEvent) => {
    e.preventDefault();

    batch(() => {
      setIsLocalResizing(true);
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
        setGlobalCursorAction(true);
        break;
      case "bottom":
        document.body.style.cursor = "ns-resize";
        setGlobalCursorAction(true);
        break;
      case "corner":
        document.body.style.cursor = "nwse-resize";
        setGlobalCursorAction(true);
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
              if (newWidth >= minPx && newWidth <= componentRef?.parentElement?.getBoundingClientRect().width!) setWidth(prev => ({ ...prev, value: value }));
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
              if ((newHeight >= minPx) && (props.isRootBlock || newHeight <= componentRef?.parentElement?.getBoundingClientRect().height!)) setHeight(prev => ({ ...prev, value: value }));
              break;
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
        // if (globalCursorAction()) return;
        setIsBlockHovered(true)
      }}
      onMouseLeave={() => {
        // if (globalCursorAction()) return;
        setIsBlockHovered(false);
      }}
      onClick={() => {
        if (globalCursorAction()) return;
        setSelectedBlock({
          component: props.component,
        });
      }}
      on:dblclick={() => {
        if (globalCursorAction()) return;
        setSelectedBlock({
          component: props.component,
        });
        setDetailOpen(true);
      }}
    >
      <BlockContent
        component={props.component} 
      />
      <Show when={isFocused()}>
        <div class="absolute -top-2 -right-2 flex space-x-2 z-[12]">
          <div
            class="p-1 bg-gray-200 rounded"
            onClick={() => {
              if (globalCursorAction()) return;
              setShowResizeModal(true)
            }}
            classList={{
              "cursor-pointer hover:bg-gray-300": !globalCursorAction(),
            }}
          >
            <Scaling size={16} />
          </div>

          <div
            class="p-1 bg-gray-200 rounded"
            classList={{
              "cursor-pointer hover:bg-gray-300": !globalCursorAction(),
            }}
            onMouseEnter={() => {
              if (globalCursorAction()) return;
              setShowSplitPreview(true);
              setSplitDirection("vertical");
            }}
            onMouseLeave={() => {
              if (globalCursorAction()) return;
              setShowSplitPreview(false)
            }}
          >
            <SquareSplitVertical size={16} />
          </div>

          <div
            class="p-1 bg-gray-200 rounded"
            classList={{
              "cursor-pointer hover:bg-gray-300": !globalCursorAction(),
            }}
            onMouseEnter={() => {
              if (globalCursorAction()) return;
              setShowSplitPreview(true);
              setSplitDirection("horizontal");
            }}
            onMouseLeave={() => {
              if (globalCursorAction()) return;
              setShowSplitPreview(false)
            }}
          >
            <SquareSplitHorizontal size={16} />
          </div>

          <div 
            class="p-1 bg-gray-200 rounded"
            classList={{
              "cursor-pointer hover:bg-gray-300": !globalCursorAction(),
            }}
            on:click={() => {
              setSelectedBlock({
                component: props.component,
              });
              setDetailOpen(true);
            }}
          >
            <ReceiptText 
              size={16}
            />
          </div>

          <div 
            class="p-1 bg-red-500 text-white rounded"
            classList={{
              "cursor-pointer hover:bg-red-600": !globalCursorAction(),
            }}
            onClick={() => {
              if (globalCursorAction()) return;
              props.handleDeleteBlock(props.component.id);
            }}
          >
            <Trash size={16} />
          </div>
        </div>
      </Show>

      <Show when={showSplitPreview()}>
        <div
          class={`absolute inset-0 opacity-50 bg-amber-100 pointer-events-none rounded-2xl p-2 grid`}
          classList={{
            "grid-cols-2": splitDirection() === "horizontal",
            "grid-rows-2": splitDirection() === "vertical",
            "space-x-2": splitDirection() === "horizontal",
            "space-y-2": splitDirection() === "vertical",
          }}
        >
          <div class="border-dashed border-2 border-blue-400 rounded-2xl" />
          <div class="border-dashed border-2 border-blue-400 rounded-2xl" />
        </div>
      </Show> 

      <Show when={showResizeModal()}>
        <ResizeModal
          width={width()}
          height={height()}
          setWidth={setWidth}
          setHeight={setHeight}
          setModal={setShowResizeModal}
          parentRef={componentRef?.parentElement!}
          isRootBlock={props.isRootBlock}
        />
      </Show>

        <div
          class="absolute left-0 top-0 w-full h-full rounded-md opacity-50"
          classList={{
            "bg-white bg-[radial-gradient(#e5e7eb_3.5px,transparent_3.5px)] [background-size:12px_12px] z-10": !globalCursorAction() && dropTarget(),
            "-z-10": !dropTarget() || globalCursorAction(),
          }}
        />
        <div
          class="absolute -right-2 top-0 w-3 h-full rounded-md"
          onMouseEnter={handleDropMouseEnter}
          onMouseLeave={handleDropMouseLeave}
          classList={{
            "cursor-move": !globalCursorAction() && dropTarget(),
          }}
        />
        <div
          class="absolute -left-2 top-0 w-3 h-full rounded-md"
          onMouseEnter={handleDropMouseEnter}
          onMouseLeave={handleDropMouseLeave}
          classList={{
            "cursor-move": !globalCursorAction() && dropTarget(),
          }}
        />
        <div
          class="absolute left-0 -bottom-2 w-full h-3 rounded-md"
          onMouseEnter={handleDropMouseEnter}
          onMouseLeave={handleDropMouseLeave}
          classList={{
            "cursor-move": !globalCursorAction() && dropTarget(),
          }}
        />
        <div
          class="absolute left-0 -top-2 w-full h-3 rounded-md"
          onMouseEnter={handleDropMouseEnter}
          onMouseLeave={handleDropMouseLeave}
          classList={{
            "cursor-move": !globalCursorAction() && dropTarget(),
          }}
        />

        <div
          class="absolute -right-4 top-0 w-2 h-full rounded-r-md"
          onMouseDown={handleMouseDown("right")}
          classList={{
            "cursor-e-resize hover:bg-green-200": !globalCursorAction(),
            "bg-green-200": isLocalResizing() && resizeDirection() === "right"
          }}
        />

        <div
          class="absolute -bottom-4 left-0 w-full h-2 rounded-b-md"
          onMouseDown={handleMouseDown("bottom")}
          classList={{
            "cursor-s-resize hover:bg-green-200": !globalCursorAction(),
            "bg-green-200": isLocalResizing() && resizeDirection() === "bottom"
          }}
        />

        <div
          class="absolute -bottom-3 -right-3 w-4 h-4 rounded-sm"
          onMouseDown={handleMouseDown("corner")}
          classList={{
            "cursor-se-resize hover:bg-green-200": !globalCursorAction(),
            "bg-green-200": isLocalResizing() && resizeDirection() === "corner"
          }}
        />
    </div>
  );
}
