import { createSignal, createEffect, createMemo } from "solid-js";
import "./App.css";
import TopBar from "./layout/top-bar";
import Sidebar from "./layout/side-bar";
import Header from "./layout/header";
import BlockSection from "./layout/block-section";

interface Item {
  id: number;
  type: string;
  content: string;
}

export default function App() {

  const [elements, setElements] = createSignal<Item[]>([]);

  const addElement = (type: string) => {
    setElements(prev => [...prev, { id: Date.now(), type, content: type === "text" ? "Editable Text" : "Button" }]);
  };

  const saveToLocalStorage = () => {
    localStorage.setItem("design", JSON.stringify(elements()));
  };

  createEffect(() => {
    const saved = localStorage.getItem("design");
    if (saved) setElements(JSON.parse(saved));
  });

  const keys = createMemo(() => elements().map((el) => el.id));

  const map = createMemo(() => {
    const map = new Map<number, Item>();
    elements().forEach((item) => map.set(item.id, item));
    return map;
  });

  const [state, setState] = createSignal(JSON.parse(sessionStorage.getItem("state") || "{}"));

  createEffect(() => {
    sessionStorage.setItem("state", JSON.stringify(state()));
  });

  return (
      <div
        class="flex bg-gray-100 flex-col items-center w-full min-h-screen"
      >
        <Header class="h-[7vh]" />
        <TopBar 
          class="h-[8vh]"
        />
        <div class="flex flex-col items-center justify-start w-full h-[85vh]">
          <div class="bg-green-200 w-full h-[0.2rem]"></div>
          <div class="flex w-full rounded-xl h-[calc(100%-0.2rem)]">
            {/* ツールバー */}
            {/* <div class="w-1/4 p-4 bg-white shadow">
              <h2 class="text-lg font-bold mb-2">Add Elements</h2>
              <button class="bg-blue-500 text-white px-4 py-2 mb-2 w-full rounded" onClick={() => addElement("text")}>
                Add Text
              </button>
              <button class="bg-green-500 text-white px-4 py-2 w-full rounded" onClick={() => addElement("button")}>
                Add Button
              </button>
              <button class="mt-4 bg-gray-700 text-white px-4 py-2 w-full rounded" onClick={saveToLocalStorage}>
                Save
              </button>
            </div> */}
            <Sidebar
              collapsedClass="w-16"
              nonCollapsedClass="w-1/6"
            />

            

            <div class=" bg-gray-200 flex justify-center items-center w-full h-full p-4 ">
              {/* <For each={keys()}>
                {(key) => {
                  const item = map().get(key);
                  return (
                    <div
                      class="p-2 bg-white shadow rounded mb-2"
                      contentEditable={item?.type === "text"}
                    >
                      <Block />
                      {item?.content}
                    </div>
                  );
                }}
              </For> */}
              <BlockSection />
              {/* <BlockSection /> */}
            </div>
          </div> 
        </div>
      </div>
  );
}
