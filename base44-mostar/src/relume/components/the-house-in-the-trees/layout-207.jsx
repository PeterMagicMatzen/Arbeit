import { Button } from "@/relume/ui/button";
import React from "react";
import { ChevronRight } from "@/relume/icons";

export function Layout207() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 scheme-1 alternate logo-alt">
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 lg:gap-x-20">
          <div className="order-2 md:order-1">
            <img
              src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
              className="w-full rounded-image object-cover"
              alt=""
            />
          </div>
          <div className="order-1 md:order-2">
            <p className="mb-3 font-semibold md:mb-4">Vestige</p>
            <h2 className="mb-5 text-h2 font-bold md:mb-6">
              Blue pots sit in the light
            </h2>
            <p className="mb-5 text-medium md:mb-6">
              The blue pots catch your eye first. They do not shout, but they
              hold the light.
            </p>
            <div className="grid grid-cols-1 gap-4 py-2">
              <div className="flex self-start">
                <div className="mr-4 flex-none self-start">
                  <img
                    className="size-6 text-scheme-text"
                    src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/planet.svg"
                  />
                </div>
                <p>The first plane of the story</p>
              </div>
              <div className="flex self-start">
                <div className="mr-4 flex-none self-start">
                  <img
                    className="size-6 text-scheme-text"
                    src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/colors.svg"
                  />
                </div>
                <p>A color that remembers the sky</p>
              </div>
              <div className="flex self-start">
                <div className="mr-4 flex-none self-start">
                  <img
                    className="size-6 text-scheme-text"
                    src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/house.svg"
                  />
                </div>
                <p>What remains after the house quiets</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 md:mt-8">
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
        </div>
      </div>
    </section>
  );
}
