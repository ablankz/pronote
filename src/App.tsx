import { createSignal, createEffect } from "solid-js";
import "./App.css";
import TopBar from "./layout/top-bar";
import Sidebar from "./layout/side-bar";
import Header from "./layout/header";
import BlockSection from "./layout/block-section";
import DetailBar from "./layout/detail-bar";
import { Hostname } from "./schema/hostname";
import { Path } from "./schema/path";

interface Item {
  id: number;
  type: string;
  content: string;
}

export default function App() {

  const [elements, setElements] = createSignal<Item[]>([]);

//   console.log(PathUtils.cleanPath("/a/b/c/../d"));         // "/a/b/d"
// console.log(PathUtils.cleanPath("a/b/./c"));            // "a/b/c"
// console.log(PathUtils.cleanPath("/../a/b"));            // "/a/b"
// console.log(PathUtils.cleanPath("a///b/c/./../d"));     // "a/b/d"
// console.log(PathUtils.cleanPath("/a/b/c/../../d/e"));   // "/a/d/e"
// console.log(PathUtils.cleanPath("a/b/c/../../../x/y")); // "x/y"
// console.log(PathUtils.cleanPath("/a/./b/./c/"));        // "/a/b/c"
// console.log(PathUtils.cleanPath("././a/b/./c/.."));     // "a/b"

  // const p = new Path("././a/b/./c/../d/e", {});
  // console.log(p.down("/${id}").resolve({id: "123"}));
  // console.log(new Path("/a/b/c/def/test.png", {}).match("/a/b/**/*.png"));
  // console.log(new Path("/a/b/aa/c/def/aa/test.png", {}).match("/a/b/**/aa/*.png"));
  // console.log(new Hostname("127.*.*.1", {}).match("127.0.1.1", "this"));
  // console.log(new Hostname("127.0.0.1", {}).match("127.0.**"));
  // console.log(new Hostname("www.example.com", {}).match("*.example.co*"));
  // console.log(new Hostname("2001:0db8:85a3:0000:0000:8a2e:0370:7334", {}).match("2001:*b8:85a3:**:8a2e:0370:*"));

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
