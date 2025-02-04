import { createSignal, createEffect } from "solid-js";
import "./App.css";
import TopBar from "./layout/top-bar";
import Sidebar from "./layout/side-bar";
import Header from "./layout/header";
import BlockSection from "./layout/block-section";
import DetailBar from "./layout/detail-bar";

interface Item {
  id: number;
  type: string;
  content: string;
}

export default function App() {

  const [elements, setElements] = createSignal<Item[]>([]);

  const saveToLocalStorage = () => {
    localStorage.setItem("design", JSON.stringify(elements()));
  };

  createEffect(() => {
    const saved = localStorage.getItem("design");
    if (saved) setElements(JSON.parse(saved));
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
            <Sidebar
              collapsedClass="w-16"
              nonCollapsedClass="w-1/6"
            />
            <div class=" bg-gray-200 flex justify-center items-center w-full h-full p-4 ">
              <BlockSection />
            </div>
            <DetailBar
              class=""
              defaultWidth={360}
              minWidth={360}
              maxWidth={720}
            />
          </div> 
        </div>
        
      </div>
  );
}
