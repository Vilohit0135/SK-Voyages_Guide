/**
 * Renders each manual in public/manuals to a PDF in public/pdf.
 *
 * The hosted site is serverless and cannot spawn a browser, so the PDFs are
 * built here and committed. Re-run this (`npm run pdfs`) after editing a manual,
 * otherwise the download link serves a stale document.
 *
 * Everything a manual references (/assets/manual.css, /images/...) already lives
 * under public/, so a plain static server rooted there is enough to render it.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(projectRoot, "public");
const manualsDir = path.join(publicDir, "manuals");
const outputDir = path.join(publicDir, "pdf");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf"
};

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
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
].filter(Boolean);

function findBrowser() {
  for (const candidate of browserCandidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function pdfName(fileName) {
  const base = path
    .basename(fileName, path.extname(fileName))
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${base || "manual"}.pdf`;
}

function startStaticServer() {
  const server = http.createServer((request, response) => {
    let requestPath;
    try {
      requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
      response.writeHead(400).end("Bad request");
      return;
    }

    const filePath = path.join(publicDir, requestPath);
    // Refuse anything that escapes public/.
    if (!filePath.startsWith(publicDir + path.sep) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    fs.createReadStream(filePath).pipe(response);
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

function renderPdf(browser, pageUrl, outputPath) {
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "manual-pdf-"));
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
      reject(new Error("timed out"));
    }, 120_000);

    child.on("error", reject);
    child.on("exit", () => {
      clearTimeout(timer);
      fs.rmSync(profileDir, { recursive: true, force: true });
      resolve();
    });
  });
}

async function main() {
  const browser = findBrowser();
  if (!browser) {
    console.error("No Chrome or Edge found. Set CHROME_PATH to your browser executable.");
    process.exit(1);
  }

  const manuals = fs
    .readdirSync(manualsDir)
    .filter((name) => name.toLowerCase().endsWith(".html"))
    .sort();

  if (manuals.length === 0) {
    console.error(`No manuals found in ${manualsDir}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const { server, port } = await startStaticServer();
  console.log(`Rendering ${manuals.length} manuals with ${path.basename(browser)}\n`);

  let failed = 0;
  try {
    for (const manual of manuals) {
      const outputPath = path.join(outputDir, pdfName(manual));
      const pageUrl = `http://127.0.0.1:${port}/manuals/${encodeURIComponent(manual)}`;

      process.stdout.write(`  ${manual} -> pdf/${pdfName(manual)} ... `);
      try {
        await renderPdf(browser, pageUrl, outputPath);
        if (!fs.existsSync(outputPath)) {
          throw new Error("browser produced no file");
        }
        const kb = Math.round(fs.statSync(outputPath).size / 1024);
        console.log(`${kb} KB`);
      } catch (error) {
        failed += 1;
        console.log(`FAILED (${error.message})`);
      }
    }
  } finally {
    server.close();
  }

  if (failed > 0) {
    console.error(`\n${failed} manual(s) failed to render.`);
    process.exit(1);
  }
  console.log("\nDone. Commit public/pdf so the hosted download links work.");
}

main();
