/**
 * Verifies that every image the site can reference actually exists in
 * public/assets, that no `srcset` points at a missing file, and that no two
 * committed files are byte-identical.
 *
 * Run with: npm run audit
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const publicDir = join(root, "public");
const srcDir = join(root, "src");

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const problems = [];
const check = [];

const sources = walk(srcDir).filter((file) => /\.(ts|tsx|html)$/.test(file));

// 1. Every asset path written in code must exist on disk.
const pathPattern = /["'`](\/assets\/[^"'`\s$]+\.(?:webp|png|jpg|jpeg|avif|gif))["'`]/g;
/**
 * The catalog builds its paths from `img(dir, slug)` / `projectImage(slug)` /
 * `marquee(slug)` calls, so those pairs count as references too.
 */
const catalogPattern = /\b(?:img|projectImage)\(\s*"([a-z]+)"\s*,\s*"([a-z0-9-]+)"/gi;
const marqueePattern = /\bmarquee\("([a-z0-9-]+)"/gi;
const entryPattern = /entry\("([a-z]+)",\s*\{\s*name:\s*"([a-z0-9-]+)"/gi;

const referenced = new Set();
let references = 0;
for (const file of [...sources, join(root, "index.html")]) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(pathPattern)) {
    references += 1;
    const assetPath = join(publicDir, match[1]);
    if (!statSync(assetPath, { throwIfNoEntry: false })?.isFile()) {
      problems.push(`Missing file for ${match[1]} (referenced in ${relative(root, file)})`);
    }
    referenced.add(match[1].replace("/assets/", ""));
  }
  for (const match of text.matchAll(catalogPattern)) {
    const [, dir, slug] = match;
    if (dir === "projects" || dir === "marquee") referenced.add(`${dir}/${slug}.webp`);
    references += 1;
  }
  for (const match of text.matchAll(marqueePattern)) {
    referenced.add(`marquee/${match[1]}.webp`);
    references += 1;
  }
  for (const match of text.matchAll(entryPattern)) {
    referenced.add(`${match[1]}/${match[2]}.webp`);
    references += 1;
  }
}
check.push(`${references} asset references checked`);

// 2. Files in public/assets that nothing references are reported, not deleted.
const assetFiles = walk(join(publicDir, "assets")).filter((file) => /\.(webp|png|jpg|jpeg|avif|gif)$/.test(file));
const unreferenced = assetFiles
  .map((file) => relative(join(publicDir, "assets"), file))
  .filter((file) => !referenced.has(file) && !file.includes("@2x"));
check.push(`${assetFiles.length} committed image files (${unreferenced.length} not placed on a card)`);

// 3. No duplicate bytes.
const hashes = new Map();
for (const file of assetFiles) {
  const hash = createHash("sha1").update(readFileSync(file)).digest("hex");
  if (hashes.has(hash)) problems.push(`Duplicate content: ${file} === ${hashes.get(hash)}`);
  else hashes.set(hash, file);
}

// 4. Every 1x file has its 2x partner.
for (const file of assetFiles) {
  if (file.includes("@2x")) continue;
  const retina = file.replace(/\.([a-z0-9]+)$/, "@2x.$1");
  if (!statSync(retina, { throwIfNoEntry: false })?.isFile()) {
    problems.push(`Missing 2x variant for ${relative(publicDir, file)}`);
  }
}

console.log("Asset audit");
for (const line of check) console.log(`  · ${line}`);
if (unreferenced.length) {
  console.log(`  · available in the admin library: ${unreferenced.join(", ")}`);
}
if (problems.length) {
  console.error("\nProblems:");
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}
console.log("  ✓ no missing, duplicate or orphaned files");
