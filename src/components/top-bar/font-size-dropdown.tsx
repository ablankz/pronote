import { createSignal, For, Show, onMount, onCleanup, batch, createEffect } from "solid-js";
import Scrollable from "../scrollable";
import { fontSizeList, minFontSize } from "../../consts/font";
import { globalCursorAction } from "../../store/action";
import { pxPrecision } from "../../consts/size";

export interface FontSizeDropdownProps {
  class?: string;
  classList?: Record<string, boolean>;
  onFontSizeChange?: (fontSize: number) => void;
  fontSize: number;
  setFontSize: (fontSize: number) => void;
}

const FontSizeDropdown = (props: FontSizeDropdownProps) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [ignoreOutsideClick, setIgnoreOutsideClick] = createSignal(false);

  let modalRef: HTMLDivElement | undefined
  let downRef: HTMLInputElement | undefined
  let inputRef: HTMLInputElement | undefined

  const handleClickOutside = (event: MouseEvent) => {
      if (globalCursorAction()) return;

      if (ignoreOutsideClick()) {
          setIgnoreOutsideClick(false);
          return;
      }

      if (modalRef && !modalRef.contains(event.target as Node)
          && downRef && !downRef.contains(event.target as Node)) {
          setIsOpen(false);
      }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  createEffect(() => {
    if (inputRef) inputRef.value = props.fontSize.toFixed(pxPrecision);
  });

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("click", handleClickOutside);
  });

  const applyFontSize = (size: number) => {
    batch(() => {
      if (inputRef) inputRef.value = props.fontSize.toFixed(pxPrecision);
      setIsOpen(false);
      if (props.fontSize === size) return;
      props.setFontSize(size);
      if (props.onFontSizeChange) props.onFontSizeChange(size);
    });
  };

  const handleFontSizeChange = (sizeStr: string) => {
    // let size = parseInt(sizeStr);
    // precision 1に変換
    let size = parseFloat(sizeStr);
    if (isNaN(size) || size.toString() !== sizeStr) {
      size = props.fontSize;
    } 
    size = Math.round(size * 10 ** pxPrecision) / 10 ** pxPrecision;
    if (size < minFontSize) {
      size = minFontSize;
    }
    applyFontSize(size);
    // if (isNaN(size) || size.toString() !== sizeStr) {
    //   size = props.fontSize;
    // }else if (size < minFontSize) {
    //   size = minFontSize;
    // }
    // applyFontSize(size);
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
            }}
            class="focus:outline-none rounded-l text-white"
          />
        </div>
        <div
          class="h-full w-8 flex items-center justify-center bg-gray-600 rounded-r border-l border-gray-500"
          classList={{
            "cursor-pointer": !globalCursorAction(),
          }}
          onClick={() => {
            batch(() => {
              setIsOpen(prev => {
                if (!prev) inputRef?.select()
                return !prev
              })
              setIgnoreOutsideClick(true)
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

      <Show when={isOpen()}>
        <div 
          class="absolute w-20 z-20 max-h-[32rem] bg-gray-700 shadow-lg rounded-bl-xl"
          ref={modalRef}>
          <Scrollable class="[&::-webkit-scrollbar]:w-1 w-full z-20 max-h-[32rem]">
            <div class="w-full max-h-[32rem]">
              <For each={fontSizeList}>
                {(size) => (
                  <div 
                    class="py-1 px-3 flex items-center justify-start hover:bg-gray-400 my-1"
                    classList={{
                      "cursor-pointer": !globalCursorAction(),
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
