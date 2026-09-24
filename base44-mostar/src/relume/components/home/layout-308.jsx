import { Button } from "@/relume/ui/button";
import React from "react";
import { ChevronRight } from "@/relume/icons";

export function Layout308() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 scheme-3 alternate logo-alt">
      <div className="container">
        <div className="mb-12 grid grid-cols-1 gap-5 md:mb-18 md:grid-cols-2 md:gap-x-12 md:gap-y-8 lg:mb-20 lg:gap-x-20">
          <div>
            <p className="mb-3 font-semibold md:mb-4">Journey</p>
            <h2 className="text-h2 font-bold">How the seven planes move</h2>
          </div>
          <div>
            <p className="text-medium">
              You begin at the bridge and end at the water. Between them the
              city opens like a book. Each scroll turns a page.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-8 md:gap-y-16 lg:grid-cols-4">
          <div>
            <div className="mb-5 md:mb-6">
              <img
                className="size-12 text-scheme-text"
                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/first_page.svg"
              />
            </div>
            <h3 className="mb-3 text-h5 font-bold md:mb-4">
              Plane one, the arch
            </h3>
            <p>
              The bridge appears first against the sky, a single clean line of
              stone.
            </p>
          </div>
          <div>
            <div className="mb-5 md:mb-6">
              <img
                className="size-12 text-scheme-text"
                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/nest_wake_on_approach.svg"
              />
            </div>
            <h3 className="mb-3 text-h5 font-bold md:mb-4">
              Plane two, the approach
            </h3>
            <p>You move closer and the stone shows its age, pitted and pale.</p>
          </div>
          <div>
            <div className="mb-5 md:mb-6">
              <img
                className="size-12 text-scheme-text"
                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/3p.svg"
              />
            </div>
            <h3 className="mb-3 text-h5 font-bold md:mb-4">
              Plane three, the crossing
            </h3>
            <p>The river glints below through the gaps in the parapet.</p>
          </div>
          <div>
            <div className="mb-5 md:mb-6">
              <img
                className="size-12 text-scheme-text"
                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/lan.svg"
              />
            </div>
            <h3 className="mb-3 text-h5 font-bold md:mb-4">
              Plane four, the lanes
            </h3>
            <p>The bazaar closes in with its awnings and its voices.</p>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-4 md:mt-18 lg:mt-20">
          <Button title="Begin" variant="secondary">
            Begin
          </Button>
          <Button
            title="Guide"
            variant="link"
            size="link"
            iconRight={<ChevronRight className="text-scheme-text" />}
          >
            Guide
          </Button>
        </div>
      </div>
    </section>
  );
}
