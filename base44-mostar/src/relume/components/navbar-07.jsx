import { Button } from "@/relume/ui/button";
import { useMediaQuery } from "@/relume/hooks/use-media-query";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { KeyboardArrowDown, RelumeIcon } from "@/relume/icons";

const useRelume = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 991px)");
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const openOnMobileDropdownMenu = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const openOnDesktopDropdownMenu = () => {
    !isMobile && setIsDropdownOpen(true);
  };
  const closeOnDesktopDropdownMenu = () => {
    !isMobile && setIsDropdownOpen(false);
  };
  const animateMobileMenu = isMobileMenuOpen ? "open" : "close";
  const animateMobileMenuButtonSpan = isMobileMenuOpen
    ? ["open", "rotatePhase"]
    : "closed";
  const animateDropdownMenu = isDropdownOpen ? "open" : "close";
  const animateDropdownMenuIcon = isDropdownOpen ? "rotated" : "initial";
  return {
    toggleMobileMenu,
    openOnDesktopDropdownMenu,
    closeOnDesktopDropdownMenu,
    openOnMobileDropdownMenu,
    animateMobileMenu,
    animateMobileMenuButtonSpan,
    animateDropdownMenu,
    animateDropdownMenuIcon,
  };
};

export function Navbar7() {
  const useActive = useRelume();
  return (
    <section className="relative z-[999] flex min-h-16 w-full items-center bg-scheme-background px-[5%] md:min-h-18 scheme-1 alternate logo-alt">
      <div className="mx-auto flex size-full max-w-full items-center justify-between">
        <a href="/">
          <img
            src="/relume/logo/logo-dark.svg"
            alt="Logo image"
          />
        </a>
        <div className="absolute hidden h-screen overflow-auto border-b border-scheme-border bg-scheme-background px-[5%] pt-4 pb-24 md:pb-0 lg:static lg:ml-6 lg:flex lg:h-auto lg:flex-1 lg:items-center lg:justify-between lg:border-none lg:bg-none lg:px-0 lg:pt-0">
          <div className="flex flex-col items-center lg:flex-row">
            <a
              href="/"
              className="relative block w-auto py-3 text-base lg:inline-block lg:px-4 lg:py-6"
            >
              The bridge
            </a>
            <a
              href="/"
              className="relative block w-auto py-3 text-base lg:inline-block lg:px-4 lg:py-6"
            >
              The bazaar
            </a>
            <a
              href="/"
              className="relative block w-auto py-3 text-base lg:inline-block lg:px-4 lg:py-6"
            >
              The river
            </a>
            <div
              onMouseEnter={useActive.openOnDesktopDropdownMenu}
              onMouseLeave={useActive.closeOnDesktopDropdownMenu}
            >
              <p
                role="button"
                className="relative flex w-full items-center justify-between py-3 text-base whitespace-nowrap lg:w-auto lg:justify-start lg:gap-2 lg:px-4 lg:py-6"
                onClick={useActive.openOnMobileDropdownMenu}
              >
                Stories
                <motion.span
                  animate={useActive.animateDropdownMenuIcon}
                  variants={{
                    rotated: { rotate: 180 },
                    initial: { rotate: 0 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <KeyboardArrowDown className="text-scheme-text" />
                </motion.span>
              </p>
              <AnimatePresence>
                <motion.nav
                  variants={{
                    open: {
                      opacity: 1,
                      height: "var(--height-open, auto)",
                      display: "block",
                    },
                    close: {
                      opacity: 0,
                      height: "var(--height-close, 0)",
                      display: "none",
                    },
                  }}
                  animate={useActive.animateDropdownMenu}
                  initial="close"
                  exit="close"
                  transition={{ duration: 0.2 }}
                  className="top-full bottom-auto left-0 w-full max-w-full min-w-full overflow-hidden bg-scheme-background lg:absolute lg:w-screen lg:border-b lg:border-scheme-border lg:px-[5%] lg:[--height-close:auto]"
                >
                  <div className="mx-auto flex size-full max-w-full items-center justify-between">
                    <div className="flex w-full flex-col lg:flex-row">
                      <div className="grid flex-1 grid-cols-1 content-start items-start gap-x-8 gap-y-6 py-4 md:grid-cols-2 md:py-8 lg:auto-cols-fr lg:grid-cols-4 lg:content-stretch lg:items-stretch lg:gap-y-0">
                        <div className="grid auto-cols-fr grid-cols-1 grid-rows-[max-content_max-content_max-content_max-content_max-content] gap-y-2 md:gap-y-4">
                          <h4 className="text-small leading-[1.3] font-semibold">
                            The old town
                          </h4>
                          <a
                            href="/the-house-in-the-trees"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/house.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">The house</p>
                              <p className="hidden text-small md:block">
                                A home above the Neretva
                              </p>
                            </div>
                          </a>
                          <a
                            href="/"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/lan.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">The lanes</p>
                              <p className="hidden text-small md:block">
                                Stone paths worn smooth by time
                              </p>
                            </div>
                          </a>
                          <a
                            href="#"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/guardian.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">The towers</p>
                              <p className="hidden text-small md:block">
                                Guardians on either bank
                              </p>
                            </div>
                          </a>
                          <a
                            href="#"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/man.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">The divers</p>
                              <p className="hidden text-small md:block">
                                Men who leap from the arch
                              </p>
                            </div>
                          </a>
                        </div>
                        <div className="grid auto-cols-fr grid-cols-1 grid-rows-[max-content_max-content_max-content_max-content_max-content] gap-y-2 md:gap-y-4">
                          <h4 className="text-small leading-[1.3] font-semibold">
                            The routes
                          </h4>
                          <a
                            href="#"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/north.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">The north road</p>
                              <p className="hidden text-small md:block">
                                Where the hills begin
                              </p>
                            </div>
                          </a>
                          <a
                            href="#"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/south.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">The south road</p>
                              <p className="hidden text-small md:block">
                                Toward the sea
                              </p>
                            </div>
                          </a>
                          <a
                            href="#"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/east.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">The east bank</p>
                              <p className="hidden text-small md:block">
                                Minarets against the sky
                              </p>
                            </div>
                          </a>
                          <a
                            href="#"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/west.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">The west bank</p>
                              <p className="hidden text-small md:block">
                                Where the Croats live
                              </p>
                            </div>
                          </a>
                        </div>
                        <div className="grid auto-cols-fr grid-cols-1 grid-rows-[max-content_max-content_max-content_max-content_max-content] gap-y-2 md:gap-y-4">
                          <h4 className="text-small leading-[1.3] font-semibold">
                            The planes
                          </h4>
                          <a
                            href="#"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/flight.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">First plane</p>
                              <p className="hidden text-small md:block">
                                Light on the water
                              </p>
                            </div>
                          </a>
                          <a
                            href="#"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/architecture.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">Second plane</p>
                              <p className="hidden text-small md:block">
                                The arch itself
                              </p>
                            </div>
                          </a>
                          <a
                            href="#"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/stairs.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">Third plane</p>
                              <p className="hidden text-small md:block">
                                The bazaar stalls
                              </p>
                            </div>
                          </a>
                          <a
                            href="#"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/house.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">Fourth plane</p>
                              <p className="hidden text-small md:block">
                                The stone houses
                              </p>
                            </div>
                          </a>
                        </div>
                        <div className="grid auto-cols-fr grid-cols-1 grid-rows-[max-content_max-content_max-content_max-content_max-content] gap-y-2 md:gap-y-4">
                          <h4 className="text-small leading-[1.3] font-semibold">
                            The rest
                          </h4>
                          <a
                            href="/privacy-policy"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/privacy_tip.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">Privacy</p>
                              <p className="hidden text-small md:block">
                                How we handle data
                              </p>
                            </div>
                          </a>
                          <a
                            href="/terms-of-service"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/road.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">Terms</p>
                              <p className="hidden text-small md:block">
                                The rules of the road
                              </p>
                            </div>
                          </a>
                          <a
                            href="/"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/home.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">Home</p>
                              <p className="hidden text-small md:block">
                                Start the story again
                              </p>
                            </div>
                          </a>
                          <a
                            href="/the-house-in-the-trees"
                            className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                          >
                            <div className="flex size-6 flex-col items-center justify-center">
                              <img
                                className="text-scheme-text"
                                src="https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@latest/rounded/house.svg"
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <p className="font-semibold">The house</p>
                              <p className="hidden text-small md:block">
                                A place in the trees
                              </p>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative mb-6 flex w-full flex-col items-start justify-between p-6 sm:items-center lg:mb-0 lg:flex-row lg:px-0 lg:py-4">
                    <div className="absolute top-0 -right-[50vw] bottom-0 -left-[50vw] w-[200vw] bg-scheme-foreground" />
                    <div className="relative mb-4 grid auto-cols-fr grid-cols-[max-content] grid-rows-[auto_auto] items-center gap-x-2 gap-y-4 lg:mb-0 lg:flex lg:items-center">
                      <p>
                        Ready to walk the bridge?
                        <a href="/" className="ml-1 underline">
                          Begin the story
                        </a>
                      </p>
                    </div>
                    <div className="relative flex w-full flex-col gap-6 sm:w-auto sm:flex-row">
                      <Button
                        title="Menu"
                        variant="link"
                        size="link"
                        icon={
                          <RelumeIcon className="size-6 shrink-0 text-scheme-text" />
                        }
                      >
                        <RelumeIcon className="size-6 shrink-0 text-scheme-text" />
                        Menu
                      </Button>
                      <Button
                        title="Close"
                        variant="link"
                        size="link"
                        icon={
                          <RelumeIcon className="size-6 shrink-0 text-scheme-text" />
                        }
                      >
                        <RelumeIcon className="size-6 shrink-0 text-scheme-text" />
                        Close
                      </Button>
                    </div>
                  </div>
                </motion.nav>
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button title="Sign in" variant="secondary" size="sm">
              Sign in
            </Button>
            <Button title="Start" size="sm">
              Start
            </Button>
          </div>
        </div>
        <button
          className="-mr-2 flex size-12 cursor-pointer flex-col items-center justify-center lg:hidden"
          onClick={useActive.toggleMobileMenu}
        >
          <motion.span
            className="my-[3px] h-0.5 w-6 bg-scheme-text"
            animate={useActive.animateMobileMenuButtonSpan}
            variants={{
              open: { translateY: 8, transition: { delay: 0.1 } },
              rotatePhase: { rotate: -45, transition: { delay: 0.2 } },
              closed: {
                translateY: 0,
                rotate: 0,
                transition: { duration: 0.2 },
              },
            }}
          />
          <motion.span
            className="my-[3px] h-0.5 w-6 bg-scheme-text"
            animate={useActive.animateMobileMenu}
            variants={{
              open: { width: 0, transition: { duration: 0.1 } },
              closed: {
                width: "1.5rem",
                transition: { delay: 0.3, duration: 0.2 },
              },
            }}
          />
          <motion.span
            className="my-[3px] h-0.5 w-6 bg-scheme-text"
            animate={useActive.animateMobileMenuButtonSpan}
            variants={{
              open: { translateY: -8, transition: { delay: 0.1 } },
              rotatePhase: { rotate: 45, transition: { delay: 0.2 } },
              closed: {
                translateY: 0,
                rotate: 0,
                transition: { duration: 0.2 },
              },
            }}
          />
        </button>
      </div>
      <AnimatePresence>
        <motion.div
          variants={{ open: { height: "100dvh" }, close: { height: "auto" } }}
          animate={useActive.animateMobileMenu}
          initial="close"
          exit="close"
          className="absolute top-full right-0 left-0 w-full overflow-hidden lg:hidden"
          transition={{ duration: 0.4 }}
        >
          <motion.div
            variants={{ open: { y: 0 }, close: { y: "-100%" } }}
            animate={useActive.animateMobileMenu}
            initial="close"
            exit="close"
            transition={{ duration: 0.4 }}
            className="absolute top-0 right-0 left-0 block h-dvh overflow-auto border-b border-scheme-border bg-scheme-background px-[5%] pt-4 pb-8"
          >
            <div className="flex flex-col">
              <a href="/" className="block py-3 text-medium">
                The bridge
              </a>
              <a href="/" className="block py-3 text-medium">
                The bazaar
              </a>
              <a href="/" className="block py-3 text-medium">
                The river
              </a>
              <div>
                <p
                  role="button"
                  className="relative flex w-full items-center justify-between py-3 text-base whitespace-nowrap lg:w-auto lg:justify-start lg:gap-2 lg:px-4 lg:py-6"
                  onClick={useActive.openOnMobileDropdownMenu}
                >
                  Link Four
                  <motion.span
                    animate={useActive.animateDropdownMenuIcon}
                    variants={{
                      rotated: { rotate: 180 },
                      initial: { rotate: 0 },
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <KeyboardArrowDown className="text-scheme-text" />
                  </motion.span>
                </p>
                <AnimatePresence>
                  <motion.nav
                    variants={{
                      open: {
                        opacity: 1,
                        height: "var(--height-open, auto)",
                        display: "block",
                      },
                      close: {
                        opacity: 0,
                        height: "var(--height-close, 0)",
                        display: "none",
                      },
                    }}
                    animate={useActive.animateDropdownMenu}
                    initial="close"
                    exit="close"
                    transition={{ duration: 0.2 }}
                    className="top-full bottom-auto left-0 w-full max-w-full min-w-full overflow-hidden bg-scheme-background lg:absolute lg:w-screen lg:border-b lg:border-scheme-border lg:px-[5%] lg:[--height-close:auto]"
                  >
                    <div className="mx-auto flex size-full max-w-full items-center justify-between">
                      <div className="flex w-full flex-col lg:flex-row">
                        <div className="grid flex-1 grid-cols-1 content-start items-start gap-x-8 gap-y-6 py-4 md:grid-cols-2 md:py-8 lg:auto-cols-fr lg:grid-cols-4 lg:content-stretch lg:items-stretch lg:gap-y-0">
                          <div className="grid auto-cols-fr grid-cols-1 grid-rows-[max-content_max-content_max-content_max-content_max-content] gap-y-2 md:gap-y-4">
                            <h4 className="text-small leading-[1.3] font-semibold">
                              Page group one
                            </h4>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page One</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Two</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Three</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page four</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                          </div>
                          <div className="grid auto-cols-fr grid-cols-1 grid-rows-[max-content_max-content_max-content_max-content_max-content] gap-y-2 md:gap-y-4">
                            <h4 className="text-small leading-[1.3] font-semibold">
                              Page group two
                            </h4>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Five</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Six</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Seven</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Eight</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                          </div>
                          <div className="grid auto-cols-fr grid-cols-1 grid-rows-[max-content_max-content_max-content_max-content_max-content] gap-y-2 md:gap-y-4">
                            <h4 className="text-small leading-[1.3] font-semibold">
                              Page group three
                            </h4>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Nine</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Ten</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Eleven</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Twelve</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                          </div>
                          <div className="grid auto-cols-fr grid-cols-1 grid-rows-[max-content_max-content_max-content_max-content_max-content] gap-y-2 md:gap-y-4">
                            <h4 className="text-small leading-[1.3] font-semibold">
                              Page group four
                            </h4>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Thirteen</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Fourteen</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Fifteen</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                            <a
                              href="#"
                              className="grid w-full auto-cols-fr grid-cols-[max-content_1fr] items-start gap-x-3 py-2"
                            >
                              <div className="flex size-6 flex-col items-center justify-center">
                                <RelumeIcon className="text-scheme-text" />
                              </div>
                              <div className="flex flex-col items-start justify-center">
                                <h5 className="font-semibold">Page Sixteen</h5>
                                <p className="hidden text-small md:block">
                                  Lorem ipsum dolor sit amet consectetur elit
                                </p>
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="relative mb-6 flex w-full flex-col items-start justify-between p-6 sm:items-center lg:mb-0 lg:flex-row lg:px-0 lg:py-4">
                      <div className="absolute top-0 -right-[50vw] bottom-0 -left-[50vw] w-[200vw] bg-scheme-foreground" />
                      <div className="relative mb-4 grid auto-cols-fr grid-cols-[max-content] grid-rows-[auto_auto] items-center gap-x-2 gap-y-4 lg:mb-0 lg:flex lg:items-center">
                        <p>
                          Ready to get started?
                          <a href="#" className="ml-1 underline">
                            Sign up for free
                          </a>
                        </p>
                      </div>
                      <div className="relative flex w-full flex-col gap-6 sm:w-auto sm:flex-row">
                        <Button
                          title="Button"
                          variant="link"
                          size="link"
                          icon={
                            <RelumeIcon className="size-6 shrink-0 text-scheme-text" />
                          }
                        >
                          <RelumeIcon className="size-6 shrink-0 text-scheme-text" />
                          Button
                        </Button>
                        <Button
                          title="Button"
                          variant="link"
                          size="link"
                          icon={
                            <RelumeIcon className="size-6 shrink-0 text-scheme-text" />
                          }
                        >
                          <RelumeIcon className="size-6 shrink-0 text-scheme-text" />
                          Button
                        </Button>
                      </div>
                    </div>
                  </motion.nav>
                </AnimatePresence>
              </div>
              <div className="mt-6 flex flex-col gap-4">
                <Button title="Button" variant="secondary" size="sm">
                  Button
                </Button>
                <Button title="Button" size="sm">
                  Button
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
