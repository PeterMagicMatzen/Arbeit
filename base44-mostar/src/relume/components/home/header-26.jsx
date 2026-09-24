import { Button } from "@/relume/ui/button";
import React from "react";

export function Header26() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 scheme-1 alternate logo-alt">
      <div className="container flex flex-col items-center text-center">
        <div className="mb-12 md:mb-18 lg:mb-20">
          <div className="mx-auto w-full max-w-lg">
            <h1 className="mb-5 text-h1 font-bold md:mb-6">
              Mostar in seven planes of light
            </h1>
            <p className="text-medium">
              Scroll through the Old Bridge, the bazaar lanes, and the routes
              down to the Neretva. Each plane holds a different shadow.
            </p>
            <div className="mt-6 flex items-center justify-center gap-x-4 md:mt-8">
              <Button title="Begin">Begin</Button>
              <Button title="Explore" variant="secondary">
                Explore
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full">
          <img
            src="/relume/images/home-feature-section-0.jpg"
            className="aspect-video size-full rounded-image object-cover"
            alt=""
          />
        </div>
      </div>
    </section>
  );
}
