import React from "react";

export function Testimonial3() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 scheme-1 alternate logo-alt">
      <div className="container">
        <div className="mx-auto mb-12 w-full max-w-lg text-center md:mb-18 lg:mb-20">
          <h1 className="mb-5 text-h2 font-bold md:mb-6">Viewer impressions</h1>
          <p className="text-medium">
            What people say after they have walked the seven planes.
          </p>
        </div>
        <div className="grid grid-cols-1 items-start gap-y-12 md:grid-cols-3 md:gap-x-8 lg:gap-x-12 lg:gap-y-16">
          <div className="flex h-full flex-col items-center justify-between text-center">
            <div className="mb-6 inline-block md:mb-8">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/webflow-logo.svg"
                alt="Webflow logo 1"
                className="max-h-14"
              />
            </div>
            <h5 className="text-h6 font-bold">
              "The bridge felt close enough to touch. I forgot I was looking at
              a screen."
            </h5>
            <div className="mt-6 flex flex-col items-center justify-center md:mt-8">
              <div className="mx-auto mb-3 size-14 min-h-14 min-w-14 overflow-hidden rounded-full md:mb-4">
                <img
                  src="/relume/images/home-testimonial-section-0.jpg"
                  alt="Testimonial avatar 1"
                  className="size-full object-cover"
                />
              </div>
              <p className="font-semibold">Amir Kovač</p>
              <p>Travel writer, Sarajevo</p>
            </div>
          </div>
          <div className="flex h-full flex-col items-center justify-between text-center">
            <div className="mb-6 inline-block md:mb-8">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/webflow-logo.svg"
                alt="Webflow logo 2"
                className="max-h-14"
              />
            </div>
            <h5 className="text-h6 font-bold">
              "The shadows move like memory. It is the truest portrait of Mostar
              I have seen."
            </h5>
            <div className="mt-6 flex flex-col items-center justify-center md:mt-8">
              <div className="mx-auto mb-3 size-14 min-h-14 min-w-14 overflow-hidden rounded-full md:mb-4">
                <img
                  src="/relume/images/home-testimonial-section-1.jpg"
                  alt="Testimonial avatar 2"
                  className="size-full object-cover"
                />
              </div>
              <p className="font-semibold">Lena Horvat</p>
              <p>Photographer, Zagreb</p>
            </div>
          </div>
          <div className="flex h-full flex-col items-center justify-between text-center">
            <div className="mb-6 inline-block md:mb-8">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/webflow-logo.svg"
                alt="Webflow logo 3"
                className="max-h-14"
              />
            </div>
            <h5 className="text-h6 font-bold">
              "I have stood on that bridge. This made me feel the wind again."
            </h5>
            <div className="mt-6 flex flex-col items-center justify-center md:mt-8">
              <div className="mx-auto mb-3 size-14 min-h-14 min-w-14 overflow-hidden rounded-full md:mb-4">
                <img
                  src="/relume/images/home-testimonial-section-2.jpg"
                  alt="Testimonial avatar 3"
                  className="size-full object-cover"
                />
              </div>
              <p className="font-semibold">David Miller</p>
              <p>Architect, London</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
