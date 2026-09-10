import type { ImageMetadata } from "astro";
import fl2d from "@/assets/badges/fl2d.png";
import fl3d from "@/assets/badges/fl3d.png";
import flsa from "@/assets/badges/flsa.png";
import flin from "@/assets/badges/flin.png";
import kmp from "@/assets/badges/kmp.webp";
import esk from "@/assets/badges/esk.png";
import flowManager from "@/assets/badges/flow-manager.png";
import csm from "@/assets/badges/csm.png";
import cspo from "@/assets/badges/cspo.png";
import aCsm from "@/assets/badges/a-csm.png";
import aCspo from "@/assets/badges/a-cspo.png";
import cspSm from "@/assets/badges/csp-sm.png";
import aiForScrumMasters from "@/assets/badges/ai-for-scrum-masters.png";
import aiForProductOwners from "@/assets/badges/ai-for-product-owners.png";
import icpAcc from "@/assets/badges/icp-acc.png";
import icpAtf from "@/assets/badges/icp-atf.png";
import icpCat from "@/assets/badges/icp-cat.png";
import cal1 from "@/assets/badges/cal-1.png";
import cal2 from "@/assets/badges/cal-2.png";
import leadingSafe from "@/assets/badges/leading-safe.png";
import safeForTeams from "@/assets/badges/safe-for-teams.png";

// Certification badges, keyed by training-course id (the content
// collection slug, e.g. src/content/training-courses/fl2d.md -> "fl2d").
// Every course has one; the UI still skips the sticker for any id
// missing here rather than showing a mismatched generic image.
export const courseBadges: Record<string, ImageMetadata> = {
  fl2d,
  fl3d,
  flsa,
  flin,
  kmp1: kmp,
  kmp2: kmp,
  esk,
  "flow-manager": flowManager,
  csm,
  cspo,
  "a-csm": aCsm,
  "a-cspo": aCspo,
  "csp-sm": cspSm,
  "ai-for-scrum-masters": aiForScrumMasters,
  "ai-for-product-owners": aiForProductOwners,
  "icp-acc": icpAcc,
  "icp-atf": icpAtf,
  "icp-cat": icpCat,
  "cal-1": cal1,
  "cal-2": cal2,
  "leading-safe": leadingSafe,
  "safe-for-teams": safeForTeams,
};
