import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";
import { resolveStaticPath } from "../../../../lib/html-pages";

// child_process is unavailable on the edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const RENDER_TIMEOUT_MS = 90_000;

// Chrome renders the manual using the same print stylesheet the browser would.
const browserCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
].filter(Boolean);

function findBrowser() {
  for (const candidate of browserCandidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {
      // Ignore unreadable paths and keep looking.
    }
  }
  return null;
}

function downloadName(absolutePath) {
  const base = path
    .basename(absolutePath, path.extname(absolutePath))
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${base || "manual"}.pdf`;
}

function renderPdf(browser, pageUrl, outputPath, profileDir) {
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--disable-extensions",
    `--user-data-dir=${profileDir}`,
    "--virtual-time-budget=25000",
    "--no-pdf-header-footer",
    `--print-to-pdf=${outputPath}`,
    pageUrl
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(browser, args, { windowsHide: true });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Timed out while rendering the PDF."));
    }, RENDER_TIMEOUT_MS);

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("exit", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

export async function GET(request, { params }) {
  const absolutePath = resolveStaticPath(params.file);

  if (!absolutePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const extension = path.extname(absolutePath).toLowerCase();
  if (extension !== ".html" && extension !== ".htm") {
    return new NextResponse("Only manual pages can be exported as PDF.", { status: 400 });
  }

  const browser = findBrowser();
  if (!browser) {
    return new NextResponse(
      "No Chrome or Edge installation was found. Set the CHROME_PATH environment variable to your browser executable.",
      { status: 500 }
    );
  }

  // Render the manual as the browser serves it, so images and the stylesheet resolve.
  // Next decodes the route params, so re-encode: the filenames contain spaces.
  const origin = new URL(request.url).origin;
  const pageUrl = `${origin}/files/${params.file.map(encodeURIComponent).join("/")}`;

  let workDir;
  try {
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), "manual-pdf-"));
    const outputPath = path.join(workDir, "manual.pdf");

    await renderPdf(browser, pageUrl, outputPath, path.join(workDir, "profile"));

    if (!fs.existsSync(outputPath)) {
      throw new Error("The browser exited without producing a PDF.");
    }

    const pdf = fs.readFileSync(outputPath);

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${downloadName(absolutePath)}"`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return new NextResponse(`Could not build the PDF: ${error.message}`, { status: 500 });
  } finally {
    if (workDir) {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  }
}
