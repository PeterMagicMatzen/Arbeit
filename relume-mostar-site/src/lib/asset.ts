// Resolves a root-relative public asset path against Vite's base URL, so
// images load correctly whether the site is served at "/" (local dev) or
// under a subpath such as "/Arbeit/" (GitHub Pages project site).
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
