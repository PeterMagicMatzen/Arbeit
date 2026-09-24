import { HashRouter, Routes, Route } from "react-router-dom";
import Mostar from "@/pages/Mostar";
import Efeuhaus from "@/pages/Efeuhaus";
import EfeuhausStory from "@/pages/EfeuhausStory";
import { Footer4 } from "@/components/Footer4";
import { asset } from "@/lib/asset";

const efeuhausFooterProps = {
  logo: {
    url: "#efeuhaus-hero",
    src: asset("/images/figma-hero/01_Vordergrund.png"),
    alt: "Efeuhaus logo mark",
  },
  columnLinks: [
    {
      links: [
        { title: "Intro", url: "#efeuhaus-hero" },
        { title: "The House", url: "#the-house" },
        { title: "The Garden", url: "#the-garden" },
        { title: "Seasons", url: "#seasons" },
      ],
    },
  ],
  footerText: "© 2026 The House in the Trees. All rights reserved.",
};

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
                <EfeuhausStory />
                <Footer4 {...efeuhausFooterProps} />
              </>
            }
          />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
