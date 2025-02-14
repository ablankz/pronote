import { createSignal, For, Show, onMount, onCleanup, batch, createEffect } from "solid-js";
import Scrollable from "../scrollable";
import { defaultFontColor, lightnessRateList, representFontColorList } from "../../consts/font";
import { globalCursorAction } from "../../store/action";
import { 
  attachColor, 
  Color, 
  ColorEqualOptions, 
  ColorOptions, 
  colorToString, 
  equalsColor, 
  resolveColor
} from "../../utils/color";
import { ChevronsRight, Palette } from "lucide-solid";
import ColorPicker from "../../operator/color/color-picker";
import { useAnimationShow } from "../../hooks/use-animation-show";

export interface FontColorDropdownProps {
    class?: string;
    classList?: Record<string, boolean>;
    onFontColorChange?: (fontColor: string) => void;
    onToggle?: (isOpen: boolean) => void;
    fontColor: string;
    setFontColor: (fontColor: string) => void;
}

const colorEqualsOptions: ColorEqualOptions = { 
    base: "hsl", 
    rgbTolerance: 0, 
    hueTolerance: 10, 
    saturationTolerance: 5,
    lightnessTolerance: 5,
    alphaTolerance: 1,
};

const FontColorDropdown = (props: FontColorDropdownProps) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [ignoreOutsideClick, setIgnoreOutsideClick] = createSignal(false);
  const [localColor, setLocalColor] = createSignal(defaultFontColor);
  const [colorValue, setColorValue] = createSignal<Color | null>(null);
  const [openColorPicker, setOpenColorPicker] = createSignal(false);

  const { render, visible } = useAnimationShow(isOpen);
  const { render: renderColorPicker, visible: visibleColorPicker } = useAnimationShow(openColorPicker);

  createEffect(() => {
    if (props.fontColor !== "") {
      setLocalColor(props.fontColor);
      setColorValue(resolveColor(props.fontColor));
    } else {
      setColorValue(null);
    }
  });

  let modalRef: HTMLDivElement | undefined
  let downRef: HTMLDivElement | undefined
  let pickerCloseIgnoreRef: HTMLDivElement | undefined

  const handleClickOutside = (event: MouseEvent) => {
      if (globalCursorAction() || openColorPicker() || !isOpen()) return;

      if (ignoreOutsideClick()) {
          setIgnoreOutsideClick(false);
          return;
      }

      if (modalRef && !modalRef.contains(event.target as Node)
          && downRef && !downRef.contains(event.target as Node)) {
          setIsOpen(false);
          props.onToggle && props.onToggle(false);
      }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (openColorPicker() || !isOpen()) return;

    if (e.key === "Escape") {
      setIsOpen(false);
      props.onToggle && props.onToggle(false);
    }
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("click", handleClickOutside);
  });

  const applyFontColor = (color: string) => {
    batch(() => {
      if (props.fontColor === color) return;
      props.setFontColor(color);
      if (props.onFontColorChange) props.onFontColorChange(color);
    });
  };

  return (
    <div 
      class={`relative ${props.class}`}
      classList={{
        ...(props.classList || {}),
      }}
    >
      <div class="rounded w-12 h-7 flex items-center justify-around" ref={downRef}>
        <div 
          class="relative w-6 h-6 pb-1 flex items-center justify-center text-white font-bold rounded"
          classList={{
            "cursor-pointer hover:bg-gray-500": !globalCursorAction(),
            "bg-gray-600": props.fontColor === "",
            "bg-gray-700 border border-gray-400": props.fontColor !== "",
          }}
          onClick={() => {
            batch(() => {
              if (props.fontColor === "" && localColor() === "") return;
              if (props.fontColor === "") {
                props.setFontColor(localColor());
                if (props.onFontColorChange) props.onFontColorChange(localColor());
                setIgnoreOutsideClick(true);
              } else {
                props.setFontColor("");
                if (props.onFontColorChange) props.onFontColorChange("");
                setIgnoreOutsideClick(true);
              }
            });
          }}
        >
          A
          <div 
            class="absolute bottom-0.5 mx-0.5 left-0 right-0 h-1 bg-gray-500"
            style={{ "background-color": localColor() === "" ? "var(--color-gray-500)" : localColor() }}
          />
        </div>
        <div
          class="h-full w-4 flex items-center justify-center bg-gray-600 rounded-r border-gray-500"
          classList={{
            "cursor-pointer": !globalCursorAction(),
          }}
          onClick={() => {
            batch(() => {
              setIsOpen(prev => {
                const next = !prev;
                props.onToggle && props.onToggle(next);
                return next;
              });
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

        <Show when={render()}>
          <div
            class="absolute w-96 px-2 z-20 bg-gray-700 shadow-lg rounded-bl-xl rounded-r-xl flex flex-col items-center transition-all transform duration-300"
            classList={{
              "max-h-[26rem]": visible(),
              "max-h-0": !visible(),
            }}
            ref={modalRef}>
            <div 
              class="h-[2rem] flex items-center text-white font-bold transition-transform transform duration-300"
              classList={{
                "scale-0": !isOpen(),
              }}
            >
                Font Color
            </div>
          <div
            class="w-full flex items-center justify-start px-5 my-1 py-2 transition-transform transform duration-300"
            classList={{
              "cursor-pointer hover:bg-gray-600": !globalCursorAction(),
              "bg-gray-600": localColor() === "",
              "scale-0": !isOpen(),
            }}
            onClick={() => {
              if (props.fontColor === "" && localColor() === "") return;
              setLocalColor("");
              props.setFontColor("");
              if (props.onFontColorChange) props.onFontColorChange("");
              setIgnoreOutsideClick(true);
            }}
          >
            <ColorBox color="#000000" size={20} />
            <span class="text-white ml-2">
              Automatic Color
            </span>
          </div>
          <div class="h-[1px] bg-gray-200 w-7/8" />
          <Scrollable 
            class="[&::-webkit-scrollbar]:w-1 w-full z-20 transition-all transform duration-300"
            classList={{
              "max-h-[calc(20rem-2px)]": isOpen(),
              "max-h-0": !isOpen(),
            }}
          >
            <div 
              class="w-full py-2 transition-all transform duration-300"
              classList={{
                "max-h-[calc(20rem-2px)]": isOpen(),
                "max-h-0": !isOpen(),
              }}
            >
              {/* Present Color */}
              <div class="mt-2 flex items-center justify-center px-3 space-x-2 h-[1rem]">
                <For each={representFontColorList}>
                  {(color) => {
                    const colorVal = resolveColor(color);
                    const colorStr = colorToString(colorVal, "hsl");
                    return (
                    <div
                      class="w-[20px] h-[20px] flex items-center justify-center rounded"
                      classList={{
                        "cursor-pointer hover:bg-black hover:w-[22px] hover:h-[22px]": !globalCursorAction(),
                        "outline-2": colorValue() !== null && equalsColor(colorValue()!, colorVal, colorEqualsOptions),
                      }}
                      onClick={() => {
                        applyFontColor(colorStr);
                        setIgnoreOutsideClick(true);
                      }}
                    >
                      <ColorBox color={colorStr} size={20} />
                    </div>
                  )}}
                </For>
              </div>
              {/* Grid Color List */}
              <div class="mt-4 flex flex-col items-center justify-around px-3">
                <For each={lightnessRateList}>
                  {(rate) => (
                    <div class="flex items-center w-full my-1 justify-center px-3 space-x-2 h-6">
                      <For each={representFontColorList}>
                        {(color) => {
                          let colorVal = resolveColor(color);
                          const options: ColorOptions = {
                            lightness: {
                              isLight: rate.isLight,
                              rate: rate.rate,
                            },
                          };
                          colorVal = attachColor(colorVal, options);
                          const colorStr = colorToString(colorVal, "hsl");
                          return (
                          <div
                            class="w-[20px] h-[20px] flex items-center justify-center rounded"
                            classList={{
                              "cursor-pointer hover:bg-black hover:w-[22px] hover:h-[22px]": !globalCursorAction(),
                              "outline-2": colorValue() !== null && equalsColor(colorValue()!, colorVal, colorEqualsOptions),
                            }}
                            onClick={() => {
                              applyFontColor(colorStr);
                              setIgnoreOutsideClick(true);
                            }}
                          >
                            <ColorBox color={colorStr} size={20} />
                          </div>
                        )}}
                      </For>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Scrollable>
          <div class="h-[1px] bg-gray-200 w-7/8" />
          {/* Custom Color Picker */}
          <div 
            class="my-4 flex items-center h-[2rem] w-full justify-between px-5 py-2 transition-transform transform duration-300"
            classList={{
              "cursor-pointer hover:bg-gray-600": !globalCursorAction(),
              // "scale-0": !isOpen(),
            }}
            ref={pickerCloseIgnoreRef}
            onClick={() => {
              setOpenColorPicker(true);
            }}
          >
              <div class="flex items-center justify-start">
                <Palette size={20} />
                <span class="text-white ml-2">
                  Custom Color
                </span>
              </div>
              <div>
                <ChevronsRight size={20} />
              </div>
          </div>
        </div>
      </Show>
      <Show when={renderColorPicker()}>
        <div
          class="absolute -left-10 z-40 w-112 shadow-lg rounded-xl bg-gray-200 transition-transform transform duration-300"
          classList={{
            "scale-0": !visibleColorPicker(),
          }}
        >
          <ColorPicker
              class="w-full h-full text-gray-600"
              color={localColor()}
              isOpen={openColorPicker()}
              colorStrFormat="hsl"
              setColor={(color) => {
                applyFontColor(color);
              }}
              onClose={() => {
                setIgnoreOutsideClick(true);
              }}
              handleClose={() => {
                setOpenColorPicker(false)
              }}
              ignoreClick={globalCursorAction()}
              closeIgnoreRef={pickerCloseIgnoreRef}
              precisions={{
                alpha: 2,
                displayAlpha: 2,
              }}
            />
        </div>
      </Show>
    </div>
  );
};

export default FontColorDropdown;

export const ColorBox = (props: { color: string, size: number }) => {
  return (
    <div 
      class="rounded border border-gray-400 transition-transform transform duration-[50ms]" 
      classList={{
        "hover:scale-80": !globalCursorAction(),
      }}
      style={{ 
        "background-color": props.color,
        width: `${props.size}px`,
        height: `${props.size}px`,
      }} />
  );
}