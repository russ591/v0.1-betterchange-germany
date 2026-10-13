// The one list of "Better Change around the world" sites, used by the header
// switcher (SiteSwitcherDesktop.astro), the mobile menu section
// (SiteSwitcherMobile.astro) and the footer card (NetworkSitesFooter.astro),
// so the three can never drift apart.
//
// Going live with a country is a one-line change: set its `status` to
// "live" and give it a `url`. Adding a new country is one more entry here
// plus its flag in `flags` below. Order here is the order shown.
import type { Locale } from "@/lib/i18n";

export type NetworkStatus = "current" | "live" | "soon";

interface NetworkSiteEntry {
  key: string;
  status: NetworkStatus;
  label: Record<Locale, string>;
  /** Home page of the site; required for "live", absent for "current" and "soon". */
  url?: string;
  /** Shown as the small grey second line in the header dropdown. */
  domain: string;
  /** Key into `flags`; "globe" is the International & Denmark entry. */
  flag: keyof typeof flags;
}

export interface NetworkSite {
  key: string;
  status: NetworkStatus;
  label: string;
  url?: string;
  domain: string;
  /** Complete inline <svg> markup, rendered with set:html by NetworkFlag.astro. */
  flagSvg: string;
  isGlobe: boolean;
}

// Small inline SVG flags (18 x 12 box, rounded by the wrapper) instead of
// emoji flags, which Windows renders as bare letter pairs ("DE"). The
// International & Denmark entry gets a globe, drawn in currentColor.
const flag = (shapes: string) => `<svg viewBox="0 0 18 12" aria-hidden="true" focusable="false">${shapes}</svg>`;

const flags = {
  de: flag(
    '<rect width="18" height="4" fill="#000"/><rect y="4" width="18" height="4" fill="#dd0000"/><rect y="8" width="18" height="4" fill="#ffce00"/>'
  ),
  it: flag(
    '<rect width="6" height="12" fill="#009246"/><rect x="6" width="6" height="12" fill="#fff"/><rect x="12" width="6" height="12" fill="#ce2b37"/>'
  ),
  nl: flag(
    '<rect width="18" height="4" fill="#ae1c28"/><rect y="4" width="18" height="4" fill="#fff"/><rect y="8" width="18" height="4" fill="#21468b"/>'
  ),
  es: flag(
    '<rect width="18" height="12" fill="#aa151b"/><rect y="3" width="18" height="6" fill="#f1bf00"/>'
  ),
  se: flag(
    '<rect width="18" height="12" fill="#006aa7"/><rect x="5" width="2.4" height="12" fill="#fecc00"/><rect y="4.8" width="18" height="2.4" fill="#fecc00"/>'
  ),
  globe:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.4 4 5.5 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.5-4-9s1.4-6.6 4-9Z"/></svg>',
} as const;

const entries: NetworkSiteEntry[] = [
  { key: "de", status: "current", label: { en: "Germany", de: "Deutschland" }, domain: "betterchange-consulting.de", flag: "de" },
  {
    key: "com",
    status: "live",
    label: { en: "International & Denmark", de: "International & Dänemark" },
    url: "https://www.betterchange-consulting.com/",
    domain: "betterchange-consulting.com",
    flag: "globe",
  },
  {
    key: "it",
    status: "live",
    label: { en: "Italy", de: "Italien" },
    url: "https://www.betterchange-consulting.it/",
    domain: "betterchange-consulting.it",
    flag: "it",
  },
  {
    key: "nl",
    status: "live",
    label: { en: "Netherlands", de: "Niederlande" },
    url: "https://www.betterchange-consulting.nl/",
    domain: "betterchange-consulting.nl",
    flag: "nl",
  },
  { key: "es", status: "soon", label: { en: "Spain", de: "Spanien" }, domain: "", flag: "es" },
  { key: "se", status: "soon", label: { en: "Sweden", de: "Schweden" }, domain: "", flag: "se" },
];

export function getNetworkSites(locale: Locale): NetworkSite[] {
  return entries.map((entry) => ({
    key: entry.key,
    status: entry.status,
    label: entry.label[locale],
    url: entry.url,
    domain: entry.domain,
    flagSvg: flags[entry.flag],
    isGlobe: entry.flag === "globe",
  }));
}

/** The three groups every surface renders, in the order the brief lists them. */
export function groupNetworkSites(locale: Locale) {
  const sites = getNetworkSites(locale);
  return {
    current: sites.find((s) => s.status === "current")!,
    live: sites.filter((s) => s.status === "live"),
    soon: sites.filter((s) => s.status === "soon"),
  };
}

/** A site by key, e.g. the About page links the .com domain. */
export function getNetworkSite(key: string, locale: Locale): NetworkSite {
  const site = getNetworkSites(locale).find((s) => s.key === key);
  if (!site) throw new Error(`Unknown network site: ${key}`);
  return site;
}
