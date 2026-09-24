import { Button } from "@/relume/ui/button";
import React from "react";

export function Cta31() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 scheme-3 alternate logo-alt">
      <div className="container flex flex-col items-center">
        <div className="mb-12 text-center md:mb-18 lg:mb-20">
          <div className="mx-auto w-full max-w-lg">
            <h2 className="mb-5 text-h2 font-bold md:mb-6">
              Begin the journey now
            </h2>
            <p className="text-medium">
              The bridge waits and the river runs. The city opens for those who
              scroll.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:mt-8">
              <Button title="Begin">Begin</Button>
              <Button title="Explore" variant="secondary">
                Explore
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full">
          <img
            src="/relume/images/home-cta-section.jpg"
            className="size-full rounded-image object-cover"
            alt=""
          />
        </div>
      </div>
    </section>
  );
}
