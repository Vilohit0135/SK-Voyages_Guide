import fs from "node:fs";
import path from "node:path";

const ignoredDirs = new Set([".git", ".next", "app", "lib", "node_modules", "public"]);
const blockedFiles = new Set([
  ".env",
  ".env.local",
  ".gitignore",
  "next.config.mjs",
  "package-lock.json",
  "package.json",
  "pnpm-lock.yaml",
  "yarn.lock"
]);
const servedExtensions = new Set([
  ".html",
  ".htm",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".mp3",
  ".mp4",
  ".webm",
  ".pdf"
]);

export function getHtmlPages() {
  const root = process.cwd();
  const pages = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) {
          walk(path.join(dir, entry.name));
        }
        continue;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
        const absolutePath = path.join(dir, entry.name);
        const relativePath = path.relative(root, absolutePath).replaceAll(path.sep, "/");
        const stats = fs.statSync(absolutePath);
        pages.push({
          title: formatPageTitle(entry.name),
          path: relativePath,
          slug: encodePath(relativePath),
          bytes: stats.size,
          updatedAt: stats.mtimeMs
        });
      }
    }
  }

  walk(root);
  return pages.sort((a, b) => a.path.localeCompare(b.path));
}

export function encodePath(filePath) {
  return filePath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function resolveStaticPath(segments) {
  const root = process.cwd();
  const requestedPath = segments.map(decodeSegment).join("/");
  const absolutePath = path.resolve(root, requestedPath);
  const rootWithSeparator = `${root}${path.sep}`;
  const relativeParts = path.relative(root, absolutePath).split(path.sep);
  const relativePath = relativeParts.join("/");
  const extension = path.extname(absolutePath).toLowerCase();

  if (
    !absolutePath.startsWith(rootWithSeparator) ||
    relativeParts.some((part) => ignoredDirs.has(part)) ||
    blockedFiles.has(relativePath) ||
    !servedExtensions.has(extension)
  ) {
    return null;
  }

  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    return null;
  }

  return absolutePath;
}

function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
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
