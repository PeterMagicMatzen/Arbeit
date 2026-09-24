import { Button } from "@/relume/ui/button";
import React from "react";
import { ChevronRight } from "@/relume/icons";

export function Stats13() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 scheme-3 alternate logo-alt">
      <div className="container">
        <div className="grid grid-cols-1 gap-y-12 md:items-center md:gap-x-12 lg:grid-cols-2 lg:gap-x-20">
          <div>
            <p className="mb-3 font-semibold md:mb-4">Numbers</p>
            <h2 className="mb-5 text-h2 font-bold md:mb-6">
              The story in figures
            </h2>
            <p className="text-medium">
              A bridge and a river and the streets between them. The rest is
              just time.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
              <Button variant="secondary">Explore</Button>
              <Button
                variant="link"
                size="link"
                iconRight={<ChevronRight className="text-scheme-text" />}
              >
                Details
              </Button>
            </div>
          </div>
          <div className="grid w-full grid-cols-1 items-start justify-start gap-y-8 py-2 md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:gap-x-8 lg:gap-y-12">
            <div className="w-full border-l border-scheme-border pl-8">
              <p className="mb-2 text-[3.5rem] leading-[1.3] font-bold md:text-[4rem] lg:text-[5rem]">
                7
              </p>
              <h3 className="text-h6 font-bold">Planes of story</h3>
            </div>
            <div className="w-full border-l border-scheme-border pl-8">
              <p className="mb-2 text-[3.5rem] leading-[1.3] font-bold md:text-[4rem] lg:text-[5rem]">
                1
              </p>
              <h3 className="text-h6 font-bold">Old Bridge</h3>
            </div>
            <div className="w-full border-l border-scheme-border pl-8">
              <p className="mb-2 text-[3.5rem] leading-[1.3] font-bold md:text-[4rem] lg:text-[5rem]">
                400+
              </p>
              <h3 className="text-h6 font-bold">Years of history</h3>
            </div>
            <div className="w-full border-l border-scheme-border pl-8">
              <p className="mb-2 text-[3.5rem] leading-[1.3] font-bold md:text-[4rem] lg:text-[5rem]">
                2
              </p>
              <h3 className="text-h6 font-bold">Riverside routes</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
