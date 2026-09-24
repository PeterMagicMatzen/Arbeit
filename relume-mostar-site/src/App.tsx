import { HashRouter, Routes, Route } from "react-router-dom";
import Mostar from "@/pages/Mostar";
import Efeuhaus from "@/pages/Efeuhaus";
import { Footer4 } from "@/components/Footer4";

function App() {
  return (
    <HashRouter>
      <div style={{ background: "#0b1110", minHeight: "100vh" }}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Mostar />
                <Footer4 />
              </>
            }
          />
          <Route
            path="/efeuhaus"
            element={
              <>
                <Efeuhaus />
                <Footer4 />
              </>
            }
          />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
