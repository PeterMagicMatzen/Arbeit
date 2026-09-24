import { Button } from "@/relume/ui/button";
import React from "react";
import { ChevronRight } from "@/relume/icons";

export function Layout149() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 scheme-1 alternate logo-alt">
      <div className="container flex flex-col items-center text-center">
        <div className="mb-12 md:mb-18 lg:mb-20">
          <div className="mx-auto w-full max-w-lg">
            <p className="mb-3 font-semibold md:mb-4">River</p>
            <h2 className="mb-5 text-h2 font-bold md:mb-6">
              The paths lead down to the Neretva
            </h2>
            <p className="mb-5 text-medium md:mb-6">
              Stone steps worn smooth by feet. The water is cold and fast and it
              remembers everything.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 py-2">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/webflow-logo.svg"
                alt="Webflow logo 1"
                className="max-h-14"
              />
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/relume-logo.svg"
                alt="Relume logo 1"
                className="max-h-14"
              />
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/webflow-logo.svg"
                alt="Webflow logo 2"
                className="max-h-14"
              />
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/relume-logo.svg"
                alt="Relume logo 2"
                className="max-h-14"
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:mt-8">
              <Button title="Descend" variant="secondary">
                Descend
              </Button>
              <Button
                title="Follow"
                variant="link"
                size="link"
                iconRight={<ChevronRight className="text-scheme-text" />}
              >
                Follow
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full">
          <img
            src="/relume/images/home-feature-section-2.jpg"
            className="aspect-video size-full rounded-image object-cover"
            alt=""
          />
        </div>
      </div>
    </section>
  );
}
