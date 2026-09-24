import React from "react";

export function Footer7() {
  return (
    <footer className="px-[5%] py-12 md:py-18 lg:py-20 scheme-1 alternate logo-alt">
      <div className="container">
        <div className="flex flex-col items-center pb-12 md:pb-18 lg:pb-20">
          <a href="/" className="mb-8">
            <img
              src="/relume/logo/logo-dark.svg"
              alt="Logo image"
              className="inline-block"
            />
          </a>
          <ul className="grid grid-flow-row grid-cols-1 items-start justify-center justify-items-center gap-6 md:grid-flow-col md:grid-cols-[max-content] md:justify-center md:justify-items-start">
            <li className="font-semibold">
              <a href="/">The bridge</a>
            </li>
            <li className="font-semibold">
              <a href="/">The lanes</a>
            </li>
            <li className="font-semibold">
              <a href="/">The river</a>
            </li>
            <li className="font-semibold">
              <a href="/the-house-in-the-trees">The house</a>
            </li>
            <li className="font-semibold">
              <a href="/">Start here</a>
            </li>
          </ul>
        </div>
        <div className="h-px w-full bg-scheme-border" />
        <div className="text-small flex flex-col-reverse items-center justify-between pt-6 pb-4 text-center md:flex-row md:pt-8 md:pb-0">
          <p className="mt-8 md:mt-0">© 2025 Mostar. All rights reserved.</p>
          <ul className="text-small grid grid-flow-row grid-cols-[max-content] justify-center gap-y-4 md:grid-flow-col md:gap-x-6 md:gap-y-0">
            <li className="underline">
              <a href="/privacy-policy">Privacy Policy</a>
            </li>
            <li className="underline">
              <a href="/terms-of-service">Terms of Service</a>
            </li>
            <li className="underline">
              <a href="#">Cookies Settings</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
