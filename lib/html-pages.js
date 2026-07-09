import fs from "node:fs";
import path from "node:path";

/**
 * The manuals live under `public/`, so the host serves them as plain static
 * files. Nothing here runs per-request: the index and each viewer page are
 * pre-rendered at build time, which is what makes this work on serverless
 * hosting where the repo is not present at request time.
 */
const MANUALS_DIR = path.join(process.cwd(), "public", "manuals");

export const MANUALS_URL_PREFIX = "/manuals";

export function getHtmlPages() {
  if (!fs.existsSync(MANUALS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MANUALS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
    .map((entry) => {
      const absolutePath = path.join(MANUALS_DIR, entry.name);
      const stats = fs.statSync(absolutePath);

      return {
        title: formatPageTitle(entry.name),
        // `path` is the on-disk file name; it doubles as the route segment.
        path: entry.name,
        slug: encodePath(entry.name),
        href: `${MANUALS_URL_PREFIX}/${encodePath(entry.name)}`,
        pdfHref: `/pdf/${pdfName(entry.name)}`,
        bytes: stats.size,
        updatedAt: stats.mtimeMs
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function getHtmlPage(fileName) {
  return getHtmlPages().find((page) => page.path === fileName) || null;
}

export function encodePath(filePath) {
  return filePath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

/** Mirrors scripts/build-pdfs.mjs, so the link and the built file agree. */
export function pdfName(fileName) {
  const base = path
    .basename(fileName, path.extname(fileName))
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${base || "manual"}.pdf`;
}

function formatPageTitle(fileName) {
  const baseName = path.basename(fileName, path.extname(fileName));
  const cleanedName = baseName
    .replace(/\s*\(\d+\)\s*$/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleanedName
    .split(" ")
    .map((word) => {
      if (word.toLowerCase() === "sk") {
        return "SK";
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
