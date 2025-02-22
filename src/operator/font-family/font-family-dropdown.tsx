import { createSignal, createMemo, For, Show, onMount, onCleanup, batch, createEffect } from "solid-js";
import { useAnimationShow } from "../../hooks/use-animation-show";
import Scrollable from "../../components/scrollable";
import { defaultFontList } from "./const";

export interface FontFamilyDropdownProps {
  class?: string;
  classList?: Record<string, boolean>;
  onFontFamilyChange?: (fontFamily: string) => void;
  onToggle?: (open: boolean) => void;
  fontFamily?: string;
  setFontFamily: (fontFamily: string) => void;
  fontList?: string[];
  ignoreClick?: boolean;
}

const FontFamilyDropdown = (props: FontFamilyDropdownProps) => {
  const [query, setQuery] = createSignal("");
  const [isOpen, setIsOpen] = createSignal(false);
  const { render, visible } = useAnimationShow(isOpen);

  let modalRef: HTMLDivElement | undefined
  let downRef: HTMLDivElement | undefined
  let inputRef: HTMLInputElement | undefined

  const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen()) return;
      if (props.ignoreClick) return;

      event.preventDefault();

      if (modalRef && !modalRef.contains(event.target as Node)
          && downRef && !downRef.contains(event.target as Node)) {
          setIsOpen(false);
          props.onToggle?.(false);
      }
  };

  const filteredFonts = createMemo(() => {
    if (!!props.fontFamily) {
      return props.fontList || defaultFontList;
    }
    return (props.fontList || defaultFontList).filter((font) => font.toLowerCase().includes(query().toLowerCase()))
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (props.ignoreClick || !isOpen()) return;

    if (e.key === "Escape") {
      setIsOpen(false);
      props.onToggle?.(false);
    }
  };

  createEffect(() => {
    if (props.fontFamily !== "" && props.fontFamily !== undefined) {
      setQuery(props.fontFamily)
    } else {
      setQuery("")
    }
  });

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("mousedown", handleClickOutside);
  });

  const applyFontFamily = (font: string) => {
    batch(() => {
      setQuery(font);
      setIsOpen(false);
      props.onToggle?.(false);
      if (props.fontFamily === font) return;
      props.setFontFamily(font);
      if (props.onFontFamilyChange) props.onFontFamilyChange(font);
    });
  };

  return (
    <div 
      class={`relative ${props.class}`}
      classList={{
        ...(props.classList || {}),
      }}
    >
      <div class="rounded w-64 h-8 flex items-center" ref={downRef}>
        <div class="h-full w-8 flex items-center justify-center bg-gray-600 rounded-l border-r border-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </div>
        <div class="relative w-56 py-1 px-2 bg-gray-600 h-8 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query()}
            onInput={(e) => {
              batch(() => {
                setQuery(e.currentTarget.value)
                if (props.fontFamily !== "") {
                  props.setFontFamily("")
                }
              })
            }}
            onFocus={() => {
              setIsOpen(true)
              props.onToggle?.(true)
            }}
            class="focus:outline-none rounded-l"
            classList={{
              "text-white": props.fontFamily === "",
              "text-green-400": props.fontFamily !== "",
            }}
            placeholder="Font Family"
          />
          <Show when={query().length > 0 && (isOpen() || (!isOpen() && props.fontFamily === ""))}>
            <div 
              class="absolute right-0 top-0 h-full w-8 flex items-center justify-center"
              classList={{
                "cursor-pointer": props.ignoreClick === false,
              }}
              onClick={() => {
                batch(() => {
                  setQuery("")
                  props.setFontFamily("")
                })
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </Show>
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
                return !prev
              })
              props.onToggle?.(!isOpen())
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
          class="absolute w-80 z-20 bg-gray-700 shadow-lg rounded-bl-xl transition-all transform duration-300"
          classList={{
            "max-h-[20rem]": visible(),
            "max-h-0": !visible(),
          }}
          ref={modalRef}>
          <Scrollable
            class="[&::-webkit-scrollbar]:w-1.5 w-full z-20 transition-all duration-300"
            classList={{
              "max-h-[20rem]": visible(),
              "max-h-0": !visible(),
            }}
          >
            <div 
              class="w-full transition-all duration-300 max-h-[19rem]"
              classList={{
                "opacity-100": visible(),
                "opacity-0": !visible(),
              }}
            >
              <For each={filteredFonts()} fallback={
                <div class="p-2 text-white">
                  No font found for "{query()}"
                </div>
              }>
                {(font) => (
                  <div 
                    class="p-2 flex items-center justify-start hover:bg-gray-400 my-2"
                    classList={{
                      "cursor-pointer": props.ignoreClick === false,
                    }}
                    onClick={() => applyFontFamily(font)}
                  >
                    <div class="pl-[0.1rem] h-[0.9em] bg-white" />
                    <div
                      class="ml-2"
                      style={{ "font-family": font }}
                    >
                      {font}
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

export default FontFamilyDropdown;
