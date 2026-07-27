import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { about, albums, events, notes } from "../data.js";
import { albumCount, albumCover, albumUnit } from "./WorkIcon.jsx";

/* ---------- Photos ---------- */

export function Gallery({ onOpenWork, view = "grid" }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(albums.map((a) => a.category)))],
    []
  );
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("year");

  const shown = (filter === "All" ? albums : albums.filter((a) => a.category === filter))
    .slice()
    .sort((a, b) =>
      sort === "year" ? b.year.localeCompare(a.year) : a.title.localeCompare(b.title)
    );

  return (
    <div className="gallery">
      <div className="seg">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={"seg__btn" + (c === filter ? " is-on" : "")}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {view === "list" ? (
        <div className="filelist">
          <div className="filelist__head">
            <button type="button" onClick={() => setSort("name")} className={sort === "name" ? "is-on" : ""}>
              Name
            </button>
            <button type="button" onClick={() => setSort("year")} className={sort === "year" ? "is-on" : ""}>
              Date
            </button>
            <span>Kind</span>
          </div>
          {shown.map((a) => (
            <button key={a.slug} type="button" className="filelist__row" onClick={() => onOpenWork(a)}>
              <img className="filelist__swatch" src={albumCover(a)} alt="" />
              <span className="filelist__name">{a.title}</span>
              <span className="filelist__year">{a.year}</span>
              <span className="filelist__kind">
                Folder — {albumCount(a)} {albumUnit(a)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="gallery__grid">
          {shown.map((a) => (
            <button key={a.slug} type="button" className="gallery__cell" onClick={() => onOpenWork(a)}>
              <img className="gallery__img" src={albumCover(a)} alt={a.title} loading="lazy" />
              <span className="gallery__name">{a.title}</span>
              <span className="gallery__meta">
                {a.place} · {albumCount(a)}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="gallery__count">
        {shown.length} {shown.length === 1 ? "folder" : "folders"} ·{" "}
        {shown.reduce((n, a) => n + albumCount(a), 0)} items
      </div>
    </div>
  );
}

/* ---------- One folder ---------- */

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function Lightbox({ photos, index, onClose, onStep }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [fit, setFit] = useState("contain"); // "contain" = whole frame, "cover" = fill
  const drag = useRef(null);

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // A new photo always starts from a clean view.
  useEffect(reset, [index, reset]);

  const step = useCallback(
    (d) => {
      reset();
      onStep(d);
    },
    [onStep, reset]
  );

  const zoomBy = useCallback((factor) => {
    setZoom((z) => {
      const next = clamp(z * factor, MIN_ZOOM, MAX_ZOOM);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "+" || e.key === "=") zoomBy(1.4);
      else if (e.key === "-") zoomBy(1 / 1.4);
      else if (e.key === "0") reset();
      else if (e.key.toLowerCase() === "f") setFit((f) => (f === "contain" ? "cover" : "contain"));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step, zoomBy, reset]);

  // Panning while zoomed in.
  useEffect(() => {
    function onMove(e) {
      if (!drag.current) return;
      setPan({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
    }
    function onUp() {
      drag.current = null;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const photo = photos[index];
  const zoomed = zoom > 1;

  /* Portalled to <body>: the window's backdrop-filter makes it a containing
     block, which would otherwise trap this `position: fixed` overlay inside it. */
  return createPortal(
    <div
      className="lightbox"
      onMouseDown={onClose}
      onWheel={(e) => zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15)}
    >
      <div className="lightbox__tools" onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => zoomBy(1 / 1.4)} title="Zoom out (−)">
          −
        </button>
        <span className="lightbox__zoom">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => zoomBy(1.4)} title="Zoom in (+)">
          +
        </button>
        <button type="button" onClick={reset} title="Actual size (0)">
          Reset
        </button>
        <button
          type="button"
          className={fit === "cover" ? "is-on" : ""}
          onClick={() => setFit((f) => (f === "contain" ? "cover" : "contain"))}
          title="Fit / Fill (F)"
        >
          {fit === "contain" ? "Fit" : "Fill"}
        </button>
        <button type="button" onClick={onClose} title="Close (Esc)">
          ×
        </button>
      </div>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--prev"
        onMouseDown={(e) => {
          e.stopPropagation();
          step(-1);
        }}
        title="Previous (←)"
      >
        ‹
      </button>

      <div className="lightbox__stage" onMouseDown={(e) => e.stopPropagation()}>
        <img
          className={"lightbox__img" + (zoomed ? " is-zoomed" : "")}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            objectFit: fit,
          }}
          src={photo.src}
          alt={photo.caption}
          draggable={false}
          onDoubleClick={() => (zoomed ? reset() : setZoom(2.5))}
          onMouseDown={(e) => {
            if (!zoomed) return;
            e.preventDefault();
            drag.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
          }}
        />
      </div>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--next"
        onMouseDown={(e) => {
          e.stopPropagation();
          step(1);
        }}
        title="Next (→)"
      >
        ›
      </button>

      <div className="lightbox__caption" onMouseDown={(e) => e.stopPropagation()}>
        {photo.caption}
        <span className="lightbox__index">
          {index + 1} / {photos.length} · scroll or double-click to zoom
        </span>
      </div>
    </div>,
    document.body
  );
}

export function Album({ album }) {
  const [open, setOpen] = useState(null);
  const isVideo = !!album.videos;

  return (
    <div className="album">
      {/* Portrait frames in a landscape slot: show the whole photo, and fill the
          empty sides with a blurred copy of itself rather than cropping. */}
      <div className="album__hero">
        <img className="album__hero-blur" src={albumCover(album)} alt="" aria-hidden="true" />
        <img className="album__hero-img" src={albumCover(album)} alt={album.title} />
      </div>
      <h2 className="work-window__title">{album.title}</h2>
      <div className="work-window__sub">
        {album.place} · {album.year} · {albumCount(album)} {albumUnit(album, true)}
      </div>
      <p className="work-window__body">{album.excerpt}</p>

      {isVideo ? (
        <div className="album__videos">
          {album.videos.map((v) => (
            <figure className="album__video" key={v.src}>
              <video src={v.src} poster={v.poster} controls playsInline preload="metadata" />
              <figcaption>
                <span className="album__video-title">{v.title}</span>
                <span className="album__video-meta">{v.meta}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="album__grid">
          {album.photos.map((p, i) => (
            <button
              type="button"
              className="album__cell"
              key={p.src}
              onClick={() => setOpen(i)}
              title={p.caption}
            >
              <img src={p.src} alt={p.caption} loading="lazy" />
              <span className="album__caption">{p.caption}</span>
            </button>
          ))}
        </div>
      )}

      {open !== null && (
        <Lightbox
          photos={album.photos}
          index={open}
          onClose={() => setOpen(null)}
          onStep={(d) =>
            setOpen((i) => (i + d + album.photos.length) % album.photos.length)
          }
        />
      )}
    </div>
  );
}

/* ---------- Mail ---------- */

export function Compose() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  function send() {
    const href =
      `mailto:${about.email}?subject=${encodeURIComponent(subject || "Hello")}` +
      `&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setSent(true);
  }

  return (
    <div className="compose">
      <label className="compose__row">
        <span>To</span>
        <input value={about.email} readOnly />
      </label>
      <label className="compose__row">
        <span>Subject</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Print enquiry"
        />
      </label>
      <textarea
        className="compose__body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your message…"
        rows={6}
      />
      <div className="compose__actions">
        <button type="button" className="btn" onClick={send} disabled={!body.trim()}>
          Send
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            navigator.clipboard?.writeText(about.email);
          }}
        >
          Copy address
        </button>
        {sent && <span className="compose__sent">Opening your mail app…</span>}
      </div>
    </div>
  );
}

/* ---------- Calendar app ---------- */

export function CalendarApp({ now }) {
  const [offset, setOffset] = useState(0);
  const view = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = view.getFullYear();
  const month = view.getMonth();
  const isCurrentMonth = offset === 0;
  const today = now.getDate();

  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <div className="calapp">
      <div className="calapp__head">
        <button type="button" className="calapp__nav" onClick={() => setOffset(offset - 1)}>
          ‹
        </button>
        <div className="calapp__month">
          {view.toLocaleDateString([], { month: "long", year: "numeric" })}
        </div>
        <button type="button" className="calapp__nav" onClick={() => setOffset(offset + 1)}>
          ›
        </button>
        <button type="button" className="calapp__today" onClick={() => setOffset(0)}>
          Today
        </button>
      </div>

      <div className="calapp__grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <span className="calapp__dow" key={d}>
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          const ev = isCurrentMonth ? events.find((e) => e.day === d) : null;
          return (
            <span
              key={i}
              className={
                "calapp__day" + (isCurrentMonth && d === today ? " is-today" : "") + (d ? "" : " is-blank")
              }
            >
              {d || ""}
              {ev && <span className="calapp__dot" style={{ background: ev.color }} />}
            </span>
          );
        })}
      </div>

      <div className="mono-label">
        {isCurrentMonth ? "This month" : view.toLocaleDateString([], { month: "long" })}
      </div>
      {isCurrentMonth ? (
        events.map((e) => (
          <div className="calapp__event" key={e.title}>
            <span className="calapp__bar" style={{ background: e.color }} />
            <span>
              <span className="calapp__event-title">{e.title}</span>
              <span className="calapp__event-time">
                {view.toLocaleDateString([], { month: "short" })} {e.day} · {e.time}
              </span>
            </span>
          </div>
        ))
      ) : (
        <div className="calapp__empty">No events scheduled.</div>
      )}
    </div>
  );
}

/* ---------- About This Mac ---------- */

function detectBrowser() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge " + (ua.match(/Edg\/([\d.]+)/) || [])[1];
  if (/Firefox\//.test(ua)) return "Firefox " + (ua.match(/Firefox\/([\d.]+)/) || [])[1];
  if (/Chrome\//.test(ua)) return "Chrome " + (ua.match(/Chrome\/([\d.]+)/) || [])[1];
  if (/Safari\//.test(ua)) return "Safari " + (ua.match(/Version\/([\d.]+)/) || [])[1];
  return "Browser";
}

export function AboutMac({ sessionSeconds }) {
  const rows = [
    ["Portfolio OS", "Version 1.0 (Big Sur edition)"],
    ["Owner", about.name],
    ["Browser", detectBrowser()],
    ["Display", `${window.screen.width} × ${window.screen.height}`],
    ["Viewport", `${window.innerWidth} × ${window.innerHeight}`],
    ["Cores", navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency}-core CPU` : "—"],
    ["Memory", navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "—"],
    ["Language", navigator.language],
    ["Time zone", Intl.DateTimeFormat().resolvedOptions().timeZone],
    ["Uptime", `${Math.floor(sessionSeconds / 60)}m ${sessionSeconds % 60}s`],
  ];

  return (
    <div className="aboutmac">
      <div className="aboutmac__logo" />
      <div className="aboutmac__name">Portfolio OS</div>
      <div className="aboutmac__ver">Big Sur edition</div>
      <table className="aboutmac__table">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Help ---------- */

export function Help() {
  const shortcuts = [
    ["⌘ K", "Open Spotlight search"],
    ["⌘ J", "Toggle Notification Center"],
    ["⌘ /", "Open this Help window"],
    ["Esc", "Close whatever is on top"],
    ["Double-click", "Open a folder from the desktop"],
    ["← →", "Step through photos in the lightbox"],
    ["Drag", "Move desktop icons and windows"],
    ["Click clock", "Notification Center"],
  ];
  return (
    <div className="help">
      <p className="work-window__body">
        This desktop is a portfolio. Everything you can click does something — the menus, the
        widgets, the dock and the traffic lights on each window.
      </p>
      <div className="mono-label">Shortcuts</div>
      {shortcuts.map(([k, v]) => (
        <div className="help__row" key={k}>
          <kbd>{k}</kbd>
          <span>{v}</span>
        </div>
      ))}
      <div className="mono-label">Notes</div>
      <p className="work-window__body">
        {albums.length} folders, {albums.reduce((n, a) => n + albumCount(a), 0)} items,{" "}
        {notes.length} notes. Weather is live for {about.coords.city}.
      </p>
    </div>
  );
}

/* ---------- Trash ---------- */

export function Trash({ items, onRestore, onEmpty }) {
  if (items.length === 0) return <div className="trash__empty">Trash is empty.</div>;
  return (
    <div className="trash">
      {items.map((n) => (
        <div className="trash__row" key={n.id}>
          <span className="trash__icon" style={{ background: n.appColor }} />
          <span className="trash__text">
            <span className="trash__title">{n.title}</span>
            <span className="trash__sub">
              {n.app} · {n.ago}
            </span>
          </span>
          <button type="button" className="btn btn--ghost trash__btn" onClick={() => onRestore(n.id)}>
            Put Back
          </button>
        </div>
      ))}
      <button type="button" className="btn trash__empty-btn" onClick={onEmpty}>
        Empty Trash
      </button>
    </div>
  );
}
