"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowIcon, ClearIcon, ROLE_ICONS, SearchIcon } from "./icons";

export default function ManualGrid({ manuals }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const term = query.trim().toLowerCase();
  const results = useMemo(
    () => (term ? manuals.filter((manual) => manual.search.includes(term)) : manuals),
    [manuals, term]
  );

  useEffect(() => {
    function focusSearchOnSlash(event) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const active = document.activeElement;
      const isTyping =
        active instanceof HTMLElement &&
        (active.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName));

      if (isTyping) {
        return;
      }

      event.preventDefault();
      inputRef.current?.focus();
    }

    window.addEventListener("keydown", focusSearchOnSlash);
    return () => window.removeEventListener("keydown", focusSearchOnSlash);
  }, []);

  function clearSearch() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <>
      <div className="section-head">
        <div className="section-title">
          <h2>All manuals</h2>
          <p aria-live="polite">
            {term
              ? `${results.length} of ${manuals.length} ${manuals.length === 1 ? "manual" : "manuals"}`
              : "Pick a guide to open it in the reader."}
          </p>
        </div>

        <div className="search">
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search manuals"
            aria-label="Search manuals"
          />
          {query ? (
            <button type="button" className="search-clear" onClick={clearSearch} aria-label="Clear search">
              <ClearIcon />
            </button>
          ) : (
            <kbd aria-hidden="true">/</kbd>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <ul className="grid">
          {results.map((manual, index) => {
            const Icon = ROLE_ICONS[manual.role] ?? ROLE_ICONS.default;

            return (
              <li key={manual.path} style={{ "--i": index }}>
                <Link
                  className="card"
                  data-role={manual.role}
                  href={`/view/${manual.slug}`}
                  title={manual.path}
                >
                  <span className="card-head">
                    <span className="card-icon">
                      <Icon />
                    </span>
                    <span className="card-surface">{manual.surface}</span>
                  </span>

                  <span className="card-body">
                    <strong className="card-title">{manual.title}</strong>
                    {manual.blurb ? (
                      <span className="card-blurb">{manual.blurb}</span>
                    ) : (
                      <span className="card-path">{manual.path}</span>
                    )}
                  </span>

                  <span className="card-foot">
                    <span className="card-facts">
                      {manual.size}
                      <span aria-hidden="true"> · </span>
                      {manual.updated}
                    </span>
                    <span className="card-cta">
                      Open
                      <ArrowIcon />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty">
          <h3>Nothing matches “{query.trim()}”</h3>
          <p>
            Try a different term, or{" "}
            <button type="button" className="link" onClick={clearSearch}>
              clear the search
            </button>
            .
          </p>
        </div>
      )}
    </>
  );
}
