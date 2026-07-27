import { useEffect, useMemo, useRef, useState } from "react";
import { about, albums, notes, socials } from "../data.js";
import { albumCount, albumCover } from "./WorkIcon.jsx";

function buildIndex(apps) {
  const items = [];

  apps.forEach((a) =>
    items.push({
      id: `app-${a.id}`,
      kind: "Applications",
      title: a.label,
      sub: a.hint || "Application",
      color: a.color,
      run: a.open,
    })
  );

  albums.forEach((a) => {
    items.push({
      id: `album-${a.slug}`,
      kind: "Folders",
      title: a.title,
      sub: `${a.place} · ${albumCount(a)} items`,
      thumb: albumCover(a),
      haystack: `${a.excerpt} ${a.category}`,
      work: a,
    });

    // Individual frames, so a search for "horse" or "lantern" lands somewhere.
    a.photos.forEach((p) =>
      items.push({
        id: `photo-${p.src}`,
        kind: "Photographs",
        title: p.caption,
        sub: `${a.title} · ${a.place}`,
        thumb: p.src,
        work: a,
      })
    );
  });

  notes.forEach((n) =>
    items.push({
      id: `note-${n.title}`,
      kind: "Notes",
      title: n.title,
      sub: n.meta,
      color: "linear-gradient(135deg,#ffe390,#f5c400)",
      haystack: n.text,
      window: "notes",
    })
  );

  socials.forEach((s) =>
    items.push({
      id: `social-${s.label}`,
      kind: "Links",
      title: s.label,
      sub: s.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      color: s.color,
      href: s.url,
    })
  );

  items.push({
    id: "contact-email",
    kind: "Contact",
    title: about.email,
    sub: "Send an email",
    color: "linear-gradient(135deg,#5eb0ff,#0066dd)",
    href: `mailto:${about.email}`,
  });

  return items;
}

export default function Spotlight({ open, onClose, apps, onOpenWork, onOpenWindow }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const index = useMemo(() => buildIndex(apps), [apps]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      // focus after the panel is painted
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return index
      .filter((it) =>
        `${it.title} ${it.sub} ${it.haystack || ""} ${it.kind}`.toLowerCase().includes(term)
      )
      .slice(0, 8);
  }, [q, index]);

  useEffect(() => {
    if (active >= results.length) setActive(0);
  }, [results.length, active]);

  function launch(item) {
    if (!item) return;
    onClose();
    if (item.run) item.run();
    else if (item.work) onOpenWork(item.work);
    else if (item.window) onOpenWindow(item.window);
    else if (item.href) window.open(item.href, item.href.startsWith("mailto:") ? "_self" : "_blank");
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      launch(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  if (!open) return null;

  let lastKind = null;

  return (
    <div className="spotlight-backdrop" onMouseDown={onClose}>
      <div className="spotlight" onMouseDown={(e) => e.stopPropagation()}>
        <div className="spotlight__field">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="spotlight__icon">
            <circle cx="10.5" cy="10.5" r="6.7" stroke="currentColor" strokeWidth="2" />
            <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Spotlight Search"
            spellCheck={false}
          />
        </div>

        {q.trim() !== "" && (
          <div className="spotlight__results">
            {results.length === 0 && <div className="spotlight__none">No Results</div>}
            {results.map((it, i) => {
              const header = it.kind !== lastKind ? it.kind : null;
              lastKind = it.kind;
              return (
                <div key={it.id}>
                  {header && <div className="spotlight__group">{header}</div>}
                  <button
                    type="button"
                    className={"spotlight__row" + (i === active ? " is-active" : "")}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => launch(it)}
                  >
                    {it.thumb ? (
                      <img className="spotlight__swatch" src={it.thumb} alt="" loading="lazy" />
                    ) : (
                      <span className="spotlight__swatch" style={{ background: it.color }} />
                    )}
                    <span className="spotlight__text">
                      <span className="spotlight__title">{it.title}</span>
                      <span className="spotlight__sub">{it.sub}</span>
                    </span>
                    {i === active && <span className="spotlight__enter">↩</span>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
