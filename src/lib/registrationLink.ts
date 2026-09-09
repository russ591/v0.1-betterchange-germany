import type { CollectionEntry } from "astro:content";

// A session run by a sister site (isExternal: true) has no internal
// /training/register/[session] page at all (see that page's own
// getStaticPaths filter) -- every "Register"/"Book now" link across the
// site has to branch the same way, so it lives here once rather than
// repeating the same ternary in every list/card component.
export function registrationHref(session: CollectionEntry<"training-schedules">): string {
  return session.data.isExternal ? session.data.externalUrl! : `/training/register/${session.id}`;
}

// Spread onto the <a> so an external registration link opens in its own
// tab instead of navigating away from betterchange-consulting.de.
export function registrationLinkAttrs(session: CollectionEntry<"training-schedules">) {
  return session.data.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
}
