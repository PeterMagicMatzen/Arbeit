import { Button } from "@/relume/ui/button";
import React from "react";
import { ChevronRight } from "@/relume/icons";

export function Layout204() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 scheme-3 alternate logo-alt">
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
            <p className="mb-3 font-semibold md:mb-4">Plane</p>
            <h2 className="mb-5 text-h2 font-bold md:mb-6">
              The garden holds the sun
            </h2>
            <p className="mb-5 text-medium md:mb-6">
              Light falls here in layers. Shadow first, then the slow reveal of
              what remains.
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-6 py-2">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/webflow-logo.svg"
                alt="Webflow logo 1"
                className="max-h-12"
              />
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/relume-logo.svg"
                alt="Relume logo 1"
                className="max-h-12"
              />
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/webflow-logo.svg"
                alt="Webflow logo 2"
                className="max-h-12"
              />
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/relume-logo.svg"
                alt="Relume logo 2"
                className="max-h-12"
              />
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
