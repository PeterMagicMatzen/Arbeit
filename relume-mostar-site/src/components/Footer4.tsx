import { FacebookLogo, InstagramLogo, LinkedinLogo, XLogo, YoutubeLogo } from "relume-icons";
import { asset } from "@/lib/asset";

type ImageProps = {
  url?: string;
  src: string;
  alt?: string;
};

type Links = {
  title: string;
  url: string;
};

type ColumnLinks = {
  links: Links[];
};

type SocialMediaLinks = {
  url: string;
  icon: React.ReactNode;
};

type FooterLink = {
  title: string;
  url: string;
};

type Props = {
  logo: ImageProps;
  columnLinks: ColumnLinks[];
  socialMediaLinks: SocialMediaLinks[];
  footerText: string;
  footerLinks: FooterLink[];
};

export type Footer4Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Footer4 = (props: Footer4Props) => {
  const { logo, footerText, columnLinks, footerLinks, socialMediaLinks } = {
    ...Footer4Defaults,
    ...props,
  };
  return (
    <footer className="px-[5%] py-12 md:py-18 lg:py-20">
      <div className="container">
        <div className="grid grid-cols-1 items-center justify-center justify-items-center gap-x-[4vw] gap-y-12 pb-12 md:pb-18 lg:grid-cols-[0.25fr_1fr_0.25fr] lg:justify-between lg:gap-y-4 lg:pb-20">
          <a href={logo.url} className="lg:justify-self-start">
            <img src={logo.src} alt={logo.alt} className="inline-block" />
          </a>
          {columnLinks.map((column, index) => (
            <ul
              key={index}
              className="grid grid-flow-row grid-cols-1 items-start justify-center justify-items-center gap-6 md:grid-flow-col md:grid-cols-[max-content] md:justify-center md:justify-items-start"
            >
              {column.links.map((link, linkIndex) => (
                <li key={linkIndex} className="font-semibold">
                  <a href={link.url}>{link.title}</a>
                </li>
              ))}
            </ul>
          ))}
          <div className="flex items-start justify-start justify-items-center gap-x-3 lg:justify-self-end">
            {socialMediaLinks.map((link, index) => (
              <a key={index} href={link.url}>
                {link.icon}
              </a>
            ))}
          </div>
        </div>
        <div className="h-px w-full bg-scheme-border" />
        <div className="text-small flex flex-col-reverse items-center justify-center justify-items-center pt-6 pb-4 md:flex-row md:gap-x-6 md:pt-8 md:pb-0">
          <p className="mt-8 md:mt-0">{footerText}</p>
          <ul className="text-small grid grid-flow-row grid-cols-[max-content] items-center justify-center justify-items-center gap-y-4 md:grid-flow-col md:gap-x-6 md:gap-y-0">
            {footerLinks.map((link, index) => (
              <li key={index} className="underline">
                <a href={link.url}>{link.title}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export const Footer4Defaults: Props = {
  logo: {
    url: "#cinema",
    src: asset("/images/efeuhaus/07_Vordergrund.webp"),
    alt: "Mostar logo mark",
  },
  columnLinks: [
    {
      links: [
        { title: "Intro", url: "#cinema" },
        { title: "Bridge", url: "#bridge" },
        { title: "Bazaar", url: "#bazaar" },
        { title: "Routes", url: "#routes" },
      ],
    },
  ],
  socialMediaLinks: [
    { url: "#", icon: <FacebookLogo className="size-6 text-scheme-text" /> },
    { url: "#", icon: <InstagramLogo className="size-6 text-scheme-text" /> },
    { url: "#", icon: <XLogo className="size-6 p-0.5 text-scheme-text" /> },
    { url: "#", icon: <LinkedinLogo className="size-6 text-scheme-text" /> },
    { url: "#", icon: <YoutubeLogo className="size-6 text-scheme-text" /> },
  ],
  footerText: "© 2026 Mostar Cinematic Story. All rights reserved.",
  footerLinks: [
    { title: "Privacy Policy", url: "#" },
    { title: "Terms of Service", url: "#" },
    { title: "Cookies Settings", url: "#" },
  ],
};
