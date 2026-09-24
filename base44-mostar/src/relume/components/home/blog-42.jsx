import { Badge } from "@/relume/ui/badge";
import { Button } from "@/relume/ui/button";
import React from "react";
import { ChevronRight } from "@/relume/icons";

export function Blog42() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 scheme-1 alternate logo-alt">
      <div className="container">
        <div className="mb-12 grid grid-cols-1 items-start justify-start gap-y-8 md:mb-18 md:grid-cols-[1fr_max-content] md:items-end md:justify-between md:gap-x-12 md:gap-y-4 lg:mb-20 lg:gap-x-20">
          <div className="md:mr-12 lg:mr-0">
            <div className="w-full max-w-lg">
              <p className="mb-3 font-semibold md:mb-4">Blog</p>
              <h2 className="mb-3 text-h2 font-bold md:mb-4">
                Stories from the stones
              </h2>
              <p className="text-medium">
                Read about the bridge, the bazaar, and the river.
              </p>
            </div>
          </div>
          <div className="hidden md:flex">
            <Button variant="secondary">View all</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
          <div className="flex size-full flex-col items-start justify-start text-start">
            <a href="#" className="mb-5 w-full md:mb-6">
              <img
                src="/relume/images/home-feature-section-1.jpg"
                alt=""
                className="aspect-[3/2] size-full rounded-image object-cover"
              />
            </a>
            <div className="mb-3 flex w-full items-center justify-start md:mb-4">
              <Badge className="mr-4">History</Badge>
              <p className="inline text-small font-semibold">5 min read</p>
            </div>
            <a className="mb-2 flex justify-start text-start" href="#">
              <h2 className="text-h5 font-bold">
                The men who built the Old Bridge
              </h2>
            </a>
            <p>
              Stone cut from the hills and set by hands that knew the river.
            </p>
            <Button
              title="Read more"
              variant="link"
              size="link"
              iconRight={<ChevronRight className="text-scheme-text" />}
              className="mt-5 flex items-center justify-center gap-x-2 md:mt-6"
            >
              Read more
            </Button>
          </div>
          <div className="flex size-full flex-col items-start justify-start text-start">
            <a href="#" className="mb-5 w-full md:mb-6">
              <img
                src="/relume/images/home-blog-list-section-0.jpg"
                alt=""
                className="aspect-[3/2] size-full rounded-image object-cover"
              />
            </a>
            <div className="mb-3 flex w-full items-center justify-start md:mb-4">
              <Badge className="mr-4">Culture</Badge>
              <p className="inline text-small font-semibold">4 min read</p>
            </div>
            <a className="mb-2 flex justify-start text-start" href="#">
              <h2 className="text-h5 font-bold">
                Copper and coffee in the bazaar lanes
              </h2>
            </a>
            <p>The hammer rings and the cups are small and the talk is long.</p>
            <Button
              title="Read more"
              variant="link"
              size="link"
              iconRight={<ChevronRight className="text-scheme-text" />}
              className="mt-5 flex items-center justify-center gap-x-2 md:mt-6"
            >
              Read more
            </Button>
          </div>
          <div className="flex size-full flex-col items-start justify-start text-start">
            <a href="#" className="mb-5 w-full md:mb-6">
              <img
                src="/relume/images/home-blog-list-section-1.jpg"
                alt=""
                className="aspect-[3/2] size-full rounded-image object-cover"
              />
            </a>
            <div className="mb-3 flex w-full items-center justify-start md:mb-4">
              <Badge className="mr-4">Nature</Badge>
              <p className="inline text-small font-semibold">6 min read</p>
            </div>
            <a className="mb-2 flex justify-start text-start" href="#">
              <h2 className="text-h5 font-bold">
                The cold green water of the Neretva
              </h2>
            </a>
            <p>The river remembers every stone that has fallen into it.</p>
            <Button
              title="Read more"
              variant="link"
              size="link"
              iconRight={<ChevronRight className="text-scheme-text" />}
              className="mt-5 flex items-center justify-center gap-x-2 md:mt-6"
            >
              Read more
            </Button>
          </div>
        </div>
        <Button className="mt-10 md:hidden" variant="secondary">
          View all
        </Button>
      </div>
    </section>
  );
}
