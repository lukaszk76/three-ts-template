import "./App.css";
import { ThreeAnimation } from "./ThreeAnimation/ThreeAnimation";

function App() {
  return (
    <div className="App">
      <ThreeAnimation id="animation-id" src="/turtle.jpg" imageRatio={3 / 2} />
    </div>
  );
}

export default App;
