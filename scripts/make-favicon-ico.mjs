// Renders public/favicon.svg at 16, 32 and 48 px with sharp and packs the
// PNGs into public/favicon.ico (PNG-in-ICO, read by every current browser).
// Browsers request /favicon.ico on their own even though the layout links
// the SVG; without the file every visit logs a 404. Run from the repo root:
//   node scripts/make-favicon-ico.mjs
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
const svg = readFileSync("public/favicon.svg");
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => sharp(svg, { density: 384 }).resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
const dirSize = 16 * sizes.length;
let offset = 6 + dirSize;
const entries = [];
for (let i = 0; i < sizes.length; i++) {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 0); e.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 1);
  e.writeUInt8(0, 2); e.writeUInt8(0, 3); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(offset, 12);
  offset += pngs[i].length; entries.push(e);
}
writeFileSync("public/favicon.ico", Buffer.concat([header, ...entries, ...pngs]));
console.log("favicon.ico written:", sizes.join("/"), "px,", Buffer.concat([header, ...entries, ...pngs]).length, "bytes");
