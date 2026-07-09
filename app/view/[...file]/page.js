import Link from "next/link";
import { notFound } from "next/navigation";
import path from "node:path";
import { encodePath, getHtmlPages, resolveStaticPath } from "../../../lib/html-pages";
import { getManualMeta } from "../../../lib/manual-meta";

export default function HtmlViewPage({ params }) {
  // Same display titles as the home page, so the nav matches the card you clicked.
  const pages = getHtmlPages().map((page) => ({ ...page, title: getManualMeta(page).title }));
  const absolutePath = resolveStaticPath(params.file);

  if (!absolutePath) {
    notFound();
  }

  const requestedPath = params.file
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");
  const listedPage = pages.find((item) => item.path === requestedPath);
  const page = listedPage || {
    title: path
      .basename(requestedPath, path.extname(requestedPath))
      .replace(/\s*\(\d+\)\s*$/g, "")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    path: requestedPath,
    slug: encodePath(requestedPath)
  };

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <h1>{page.title}</h1>
          <p>{page.path}</p>
        </div>
        <nav className="nav" aria-label="HTML pages">
          <Link className="button" href="/">All pages</Link>
          {pages.map((item) => (
            <Link href={`/view/${item.slug}`} key={item.path}>
              {item.title}
            </Link>
          ))}
        </nav>
      </header>

      <iframe className="viewer" src={`/files/${page.slug}`} title={page.title} />
    </div>
  );
}
