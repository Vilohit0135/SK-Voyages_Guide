import fs from "node:fs";
import { NextResponse } from "next/server";
import path from "node:path";
import { resolveStaticPath } from "../../../../lib/html-pages";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf"
};

export async function serveWorkspaceFile(_request, { params }) {
  const absolutePath = resolveStaticPath(params.file);

  if (!absolutePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const extension = path.extname(absolutePath).toLowerCase();
  const file = fs.readFileSync(absolutePath);

  return new NextResponse(file, {
    headers: {
      "Content-Type": contentTypes[extension] || "application/octet-stream"
    }
  });
}

export const GET = serveWorkspaceFile;
