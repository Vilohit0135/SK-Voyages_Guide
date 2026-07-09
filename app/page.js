import { getHtmlPages } from "../lib/html-pages";
import { getManualMeta } from "../lib/manual-meta";
import ManualGrid from "./components/manual-grid";

// Formatted on the server and passed down as strings, so the client renders
// exactly what was sent and hydration stays stable across locales/timezones.
function formatBytes(bytes) {
  const kb = bytes / 1024;
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

function formatDate(milliseconds) {
  return new Date(milliseconds).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function HomePage() {
  const pages = getHtmlPages();

  const manuals = pages.map((page) => {
    const meta = getManualMeta(page);

    return {
      slug: page.slug,
      path: page.path,
      role: meta.key,
      title: meta.title,
      surface: meta.surface,
      blurb: meta.blurb,
      size: formatBytes(page.bytes),
      updated: formatDate(page.updatedAt),
      search: `${meta.title} ${meta.surface} ${meta.blurb} ${page.path}`.toLowerCase()
    };
  });

  const lastUpdated = pages.length
    ? formatDate(Math.max(...pages.map((page) => page.updatedAt)))
    : null;

  return (
    <div className="shell">
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            {/* The lockup already carries the wordmark and tagline, so it stands
                in for the heading text rather than repeating it. */}
            <h1 className="hero-logo">
              <img
                src="/logo.png"
                alt="Travellink — Your Ride, Our Priority"
                width="727"
                height="190"
              />
            </h1>

            <p className="hero-copy">
              Access every dashboard and app manual from one clean workspace.
            </p>
          </div>

          {pages.length > 0 ? (
            <aside className="hero-panel" aria-label="Library summary">
              <p className="stat">
                <strong>{pages.length}</strong>
                <span>{pages.length === 1 ? "Manual" : "Manuals"}</span>
              </p>
              <p className="panel-note">Last updated {lastUpdated}</p>
            </aside>
          ) : null}
        </div>
      </header>

      <main className="main">
        {manuals.length > 0 ? (
          <ManualGrid manuals={manuals} />
        ) : (
          <div className="empty">
            <h2>No HTML files found</h2>
            <p>
              Put your <code>.html</code> files in the project folder and refresh this page.
            </p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Travellink · Internal documentation</p>
        {lastUpdated ? <p>Last updated {lastUpdated}</p> : null}
      </footer>
    </div>
  );
}
