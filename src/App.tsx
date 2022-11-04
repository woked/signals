import "./styles.css";
import { effect, signal } from "./lib/signal";
import { observer } from "./lib/observer";
import { useEffect } from "react";

const count = signal(1);
const count2 = signal(1);

const Count = observer(() => {
  console.log("rerender Count1");

  return (
    <div
      onClick={() => {
        count.value = count.value + 1;
      }}
    >
      count.1: {count.value}
    </div>
  );
});

const Count2 = observer(() => {
  console.log("rerender Count2");

  return (
    <div
      onClick={() => {
        count2.value = count2.value + 1;
      }}
    >
      count.2: {count2.value}
    </div>
  );
});

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <Count />
      <Count2 />
    </div>
  );
}
