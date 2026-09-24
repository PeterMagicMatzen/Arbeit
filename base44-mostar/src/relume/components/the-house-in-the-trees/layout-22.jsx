import { Button } from "@/relume/ui/button";
import React from "react";
import { ChevronRight } from "@/relume/icons";

export function Layout22() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 scheme-3 alternate logo-alt">
      <div className="container">
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:items-center md:gap-x-12 lg:gap-x-20">
          <div>
            <div className="mb-5 md:mb-6">
              <img
                className="size-20 text-scheme-text"
                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/house.svg"
              />
            </div>
            <h2 className="mb-5 text-h2 font-bold md:mb-6">
              The ivy breathes against the wood
            </h2>
            <p className="text-medium">
              The house stands among the trees and waits. Ivy covers the wood
              like a memory that will not let go.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
              <Button title="Explore" variant="secondary">
                Explore
              </Button>
              <Button
                title="Home"
                variant="link"
                size="link"
                iconRight={<ChevronRight className="text-scheme-text" />}
              >
                Home
              </Button>
            </div>
          </div>
          <div>
            <img
              src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
              className="w-full rounded-image object-cover"
              alt=""
            />
          </div>
        </div>
      </div>
    </section>
  );
}
