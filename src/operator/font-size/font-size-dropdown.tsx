import { createSignal, For, Show, onMount, onCleanup, batch, createEffect } from "solid-js";
import { pxPrecision } from "../../consts/size";
import { fixFloatingPoint } from "../../utils/calc";
import { useAnimationShow } from "../../hooks/use-animation-show";
import Scrollable from "../../components/scrollable";
import { defaultFontSizeList, defaultMinFontSize } from "./const";

export interface FontSizeDropdownProps {
  class?: string;
  classList?: Record<string, boolean>;
  onFontSizeChange?: (fontSize: number) => void;
  onToggle?: (open: boolean) => void;
  fontSize?: number;
  setFontSize: (fontSize: number) => void;
  fontSizeList?: number[];
  fontSizeRange?: {
    min?: number;
    max?: number;
  }
  ignoreClick?: boolean;
}

const FontSizeDropdown = (props: FontSizeDropdownProps) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const { render, visible } = useAnimationShow(isOpen);

  let modalRef: HTMLDivElement | undefined
  let downRef: HTMLDivElement | undefined
  let inputRef: HTMLInputElement | undefined

  const handleClickOutside = (event: MouseEvent) => {
      if (props.ignoreClick || !isOpen()) return;

      event.preventDefault();

      if (modalRef && !modalRef.contains(event.target as Node)
          && downRef && !downRef.contains(event.target as Node)) {
          setIsOpen(false);
          props.onToggle?.(false);
      }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (props.ignoreClick || !isOpen()) return;

    if (e.key === "Escape") {
      setIsOpen(false);
      props.onToggle?.(false);
    }
  };

  createEffect(() => {
    if (inputRef) inputRef.value = props.fontSize !== undefined ? 
      props.fontSize.toFixed(pxPrecision) : "";
  });

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("mousedown", handleClickOutside);
  });

  const applyFontSize = (size: number) => {
    batch(() => {
      if (inputRef) inputRef.value = props.fontSize !== undefined ?
        props.fontSize.toFixed(pxPrecision) : "";
      setIsOpen(false);
      props.onToggle?.(false);
      if (props.fontSize === size) return;
      props.setFontSize(size);
      if (props.onFontSizeChange) props.onFontSizeChange(size);
    });
  };

  const handleFontSizeChange = (sizeStr: string) => {
    let size: number | undefined = parseFloat(sizeStr);
    if (isNaN(size) || size.toString() !== sizeStr) {
      size = props.fontSize
    } 
    if (size !== undefined) {
      size = fixFloatingPoint(size, 10 ** pxPrecision) / 10 ** pxPrecision;
      if (size < (props.fontSizeRange?.min || defaultMinFontSize)) {
        size = props.fontSizeRange?.min || defaultMinFontSize;
      }
      if (size > (props.fontSizeRange?.max || defaultMinFontSize)) {
        size = props.fontSizeRange?.max || defaultMinFontSize;
      }
      applyFontSize(size);
    }
  };

  return (
    <div 
      class={`relative ${props.class}`}
      classList={{
        ...(props.classList || {}),
      }}
    >
      <div class="rounded w-20 h-8 flex items-center" ref={downRef}>
        <div class="w-12 py-1 px-2 bg-gray-600 h-8 flex items-center">
          <input
            ref={inputRef}
            type="text"
            onChange={(e) => {
              handleFontSizeChange(e.currentTarget.value)
            }}
            onFocus={() => {
              setIsOpen(true)
              props.onToggle?.(true)
            }}
            class="focus:outline-none rounded-l text-white"
          />
        </div>
        <div
          class="h-full w-8 flex items-center justify-center bg-gray-600 rounded-r border-l border-gray-500"
          classList={{
            "cursor-pointer": props.ignoreClick === false,
          }}
          onClick={() => {
            batch(() => {
              setIsOpen(prev => {
                if (!prev) inputRef?.select()
                props.onToggle?.(!prev)
                return !prev
              })
            })
          }}
        >
            <Show when={!isOpen()}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Show>
            <Show when={isOpen()}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </Show>
        </div>
      </div>

      <Show when={render()}>
        <div
          class="absolute w-20 z-20 bg-gray-700 shadow-lg rounded-bl-xl  transition-all transform duration-300"
          classList={{
            "max-h-[32rem]": visible(),
            "max-h-0": !visible(),
          }}
          ref={modalRef}>
          <Scrollable
            class="[&::-webkit-scrollbar]:w-1 w-full z-20 transition-all transform duration-600"
            classList={{
              "max-h-[32rem]": visible(),
              "max-h-0": !visible(),
            }}
          >
            <div 
              class="w-full transition-all transform duration-300"
              classList={{
                "max-h-[32rem]": visible(),
                "max-h-0": !visible(),
              }}
            >
              <For each={props.fontSizeList || defaultFontSizeList}>
                {(size) => (
                  <div 
                    class="py-1 px-3 flex items-center justify-start hover:bg-gray-400 my-1"
                    classList={{
                      "cursor-pointer": props.ignoreClick === false,
                    }}
                    onClick={() => applyFontSize(size)}
                  >
                    <div class="text-white">
                      {size}
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Scrollable>
        </div>
      </Show>
    </div>
  );
};

export default FontSizeDropdown;
