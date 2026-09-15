// Small leading icons for the "Services" header dropdown (see
// ServicesDropdownDesktop.astro / ServicesDropdownMobile.astro) -- a
// compact nav row needs a different size than serviceIcons' card-header
// usage, so these are sized purely by the dropdown's own wrapper, same
// "no baked-in size class" convention as serviceSectionIcons.ts. No icon
// library is installed on this site (see serviceSectionIcons.ts), so
// Coaching/Consulting/Facilitation reuse the closest existing hand-drawn
// icons from that file (compass, split, users) rather than drawing near
// duplicates; Training reuses the existing services grad-cap icon with
// its own size class stripped, for the same reason.
import { serviceIcons } from "./services";
import { serviceSectionIcons, stripSizeClass } from "./serviceSectionIcons";

export const servicesNavIcons: Record<string, string> = {
  training: stripSizeClass(serviceIcons.training),
  coaching: serviceSectionIcons.compass,
  consulting: serviceSectionIcons.split,
  facilitation: serviceSectionIcons.users,
};
