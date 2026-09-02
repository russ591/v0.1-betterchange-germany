import type { ImageMetadata } from "astro";
import fl2d from "@/assets/badges/fl2d.png";
import fl3d from "@/assets/badges/fl3d.png";
import flsa from "@/assets/badges/flsa.png";
import flin from "@/assets/badges/flin.png";

// Round certification "sticker" badges, keyed by training-course id (the
// content collection slug, e.g. src/content/training-courses/fl2d.md ->
// "fl2d"). Only Flight Levels courses have a matching sticker asset today —
// every other course simply has no entry here, and the UI skips the sticker
// for those rather than showing a mismatched generic image.
export const courseBadges: Record<string, ImageMetadata> = { fl2d, fl3d, flsa, flin };
