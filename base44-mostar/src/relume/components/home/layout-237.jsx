import { Button } from "@/relume/ui/button";
import React from "react";
import { ChevronRight } from "@/relume/icons";

export function Layout237() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 scheme-1 alternate logo-alt">
      <div className="container">
        <div className="flex flex-col items-center">
          <div className="mb-12 w-full max-w-lg text-center md:mb-18 lg:mb-20">
            <p className="mb-3 font-semibold md:mb-4">Planes</p>
            <h2 className="mb-5 text-h2 font-bold md:mb-6">
              Three ways the story reveals itself
            </h2>
            <p className="text-medium">
              The city unfolds in layers. You move through them one scroll at a
              time.
            </p>
          </div>
          <div className="grid grid-cols-1 items-start justify-center gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
            <div className="flex w-full flex-col items-center text-center">
              <div className="mb-5 md:mb-6">
                <img
                  className="size-12 text-scheme-text"
                  src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/layers.svg"
                />
              </div>
              <h3 className="mb-5 text-h4 font-bold md:mb-6">
                Layered light effects
              </h3>
              <p>Each plane catches the sun at a different hour.</p>
            </div>
            <div className="flex w-full flex-col items-center text-center">
              <div className="mb-5 md:mb-6">
                <img
                  className="size-12 text-scheme-text"
                  src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/shadow.svg"
                />
              </div>
              <h3 className="mb-5 text-h4 font-bold md:mb-6">Shadow depth</h3>
              <p>The dark places give the bright ones their meaning.</p>
            </div>
            <div className="flex w-full flex-col items-center text-center">
              <div className="mb-5 md:mb-6">
                <img
                  className="size-12 text-scheme-text"
                  src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/switch_camera.svg"
                />
              </div>
              <h3 className="mb-5 text-h4 font-bold md:mb-6">
                Scroll-driven immersion
              </h3>
              <p>Your movement is the camera and the clock.</p>
            </div>
          </div>
          <div className="mt-12 flex items-center gap-4 md:mt-18 lg:mt-20">
            <Button variant="secondary">Start</Button>
            <Button
              iconRight={<ChevronRight className="text-scheme-text" />}
              variant="link"
              size="link"
            >
              Learn
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
