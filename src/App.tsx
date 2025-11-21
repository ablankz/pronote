import { createSignal, createEffect } from "solid-js";
import "./App.css";
import TopBar from "./layout/top-bar";
import Sidebar from "./layout/side-bar";
import Header from "./layout/header";
import BlockSection from "./layout/block-section";
import DetailBar from "./layout/detail-bar";
import { StringSBTValue } from "./schema/string/string";
import { SchemaBasedTransformationState } from "./schema/sbt/state";
import { SBTOperationalOwner, SBTOwner } from "./schema/sbt/owner";
import { SBTDiscardOldOperations } from "./schema/sbt/doo";
import { StringOperator } from "./schema/string/operate";

interface Item {
  id: number;
  type: string;
  content: string;
}

export default function App() {

  const [elements, setElements] = createSignal<Item[]>([]);

  const host1 = new SBTOperationalOwner("1", "host1", "operational1");
  const host2 = new SBTOwner("2", "host2");

  const str = new StringSBTValue("Hello, world!");
  const strVal = new SchemaBasedTransformationState(str);
  const strVal_1 = new SBTDiscardOldOperations(strVal, host1);
  const strVal_2 = new SBTDiscardOldOperations(strVal, host2);

  strVal_1.setMaxOperationSize(5);

  console.log("step1", `${strVal_1}`, `${strVal_2}`, strVal_1 < strVal_2);

  strVal_1.operate(StringOperator.set("hello"));
  strVal_1.operate(StringOperator.toUpper());
  strVal_1.operate(StringOperator.slice(2));
  strVal_1.operate(StringOperator.concat(" world"));
  strVal_1.operate(StringOperator.replace("world", "everyone"));
  strVal_1.operate(StringOperator.concat("!!!"));

  console.log("step2", `${strVal_1}`, `${strVal_2}`, strVal_1 < strVal_2);

  strVal_1.reverse(6);

  console.log("step3", `${strVal_1}`, `${strVal_2}`, strVal_1 < strVal_2);

  strVal_1.recover(6);

  console.log("step4", `${strVal_1}`, `${strVal_2}`, strVal_1 < strVal_2);

  strVal_1.getOperations().forEach(op => {
    console.log(op.toString());
  });

  // strVal_1.batchOperate([
  //   StringOperator.concat(" world"),
  //   StringOperator.replace("world", "everyone"),
  //   StringOperator.concat("!!!"),
  // ]);

  // console.log("step3", `${strVal_1}`, `${strVal_2}`, strVal_1 < strVal_2);

  // console.log("1 operations");
  // strVal_1.getOperations().forEach(op => {
  //   console.log(op.toString());
  // });

  // strVal_1.reverse();

  // console.log("step4", `${strVal_1}`, `${strVal_2}`, strVal_1 < strVal_2);

  // console.log("1 operations");
  // strVal_1.getOperations().forEach(op => {
  //   console.log(op.toString());
  // });

  // strVal_1.recover();

  // console.log("step5", `${strVal_1}`, `${strVal_2}`, strVal_1 < strVal_2);

  // console.log("1 operations");
  // strVal_1.getOperations().forEach(op => {
  //   console.log(op.toString());
  // });

  // strVal_2.operate(StringOperator.replace("world", "everyone"));

  // console.log("step3", `${strVal_1}`, `${strVal_2}`, strVal_1 < strVal_2);

  // strVal_1.operate(StringOperator.concat("!!!"));

  // console.log("step4", `${strVal_1}`, `${strVal_2}`, strVal_1 < strVal_2);

  // strVal_1.reverse();

  // console.log("step5", `${strVal_1}`, `${strVal_2}`, strVal_1 < strVal_2);

  // strVal_1.merge(strVal_2);

  // console.log("step6", `${strVal_1}`, `${strVal_2}`, strVal_1 < strVal_2);

  // strVal_2.merge(strVal_1);

  // console.log("step7", `${strVal_1}`, `${strVal_2}`, strVal_1 < strVal_2);



  // console.log("2 operations");
  // strVal_2.getOperations().forEach(op => {
  //   console.log(op.toString());
  // });

  // const op1 = new SampleOperation();
  // const op2 = new SampleOperation();
  // console.log(op1 < op2);
  // console.log(op1 > op2);
  // console.log(op1 >= op2);
  // op1.setID(op2.getId());
  // console.log(`op1: ${op1}, op2: ${op2}`);
  // console.log(op1 < op2);
  // console.log(op1 > op2);
  // console.log(op1 >= op2);
  // console.log(op1.equals(op2));

  // const host1 = new StringRGA("hello");
  // const server = new StringRGA("hello");

  // host1.applyLocalEdit("!!!hello world");

  // server.applyLocalEdit("Hello, everyone", Date.now() + 1000);

  // host1.applyLocalEdit("Hello, world!", Date.now() + 2000);

  // host1.mergeRemoteEdit({
  //   text: server.toString(),
  //   timestamp: server.getLastLocalChangeAt(),
  // }, Date.now() + 3000);

  // console.log(host1, server);

  // console.log(rga1, rga2);

  // rga1.insert(2, "a");
  // rga1.insert(3, "b");
  // rga1.delete(4);
  // rga2.insert(5, "Yah!");
  // rga1.merge(rga2);

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
