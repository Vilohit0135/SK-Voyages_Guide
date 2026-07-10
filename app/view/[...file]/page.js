import Link from "next/link";
import { notFound } from "next/navigation";
import { getHtmlPage, getHtmlPages } from "../../../lib/html-pages";
import { getManualMeta } from "../../../lib/manual-meta";

// Pre-render one page per manual at build time. Without this the route would be
// rendered per-request, and on serverless hosting the manual files are not on
// disk then -- which is what made every /view/... URL 404 after deploying.
export function generateStaticParams() {
  return getHtmlPages().map((page) => ({ file: [page.path] }));
}

// Do NOT set `dynamicParams = false` here. The manual filenames contain spaces,
// so the URL segment arrives percent-encoded. In production that is fine -- the
// request matches a prerendered file -- but in `next dev` there is no file, and
// Next compares the raw encoded segment against these decoded names and 404s
// every manual. Unknown paths still 404, via notFound() below.

function decodeSegments(segments) {
  return segments
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");
}

export default function HtmlViewPage({ params }) {
  const requestedPath = decodeSegments(params.file);
  const page = getHtmlPage(requestedPath);

  if (!page) {
    notFound();
  }

  // Same display titles as the home page, so the nav matches the card you clicked.
  const pages = getHtmlPages().map((item) => ({ ...item, title: getManualMeta(item).title }));
  const title = getManualMeta(page).title;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <h1>{title}</h1>
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

      <iframe className="viewer" src={page.href} title={title} />
    </div>
  );
}
