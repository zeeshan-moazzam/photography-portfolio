import { useRef, useState, useEffect } from "react";

export const albumCover = (album) => album.poster || album.photos[0]?.src;
export const albumCount = (album) =>
  album.videos ? album.videos.length : album.photos.length;

/* "13 photographs", "1 video" — `long` picks the portfolio-voice noun. */
export const albumUnit = (album, long = false) => {
  const one = album.videos ? "video" : long ? "photograph" : "photo";
  return albumCount(album) === 1 ? one : `${one}s`;
};

export default function WorkIcon({ work, selected, onSelect, onOpen }) {
  const [pos, setPos] = useState(null); // null => use % from data
  const drag = useRef(null);
  const moved = useRef(false);

  const elRef = useRef(null);

  useEffect(() => {
    function onMove(e) {
      if (!drag.current) return;
      moved.current = true;
      const el = elRef.current;
      const w = el ? el.offsetWidth : 96;
      const h = el ? el.offsetHeight : 96;
      const x = Math.max(0, Math.min(e.clientX - drag.current.dx, window.innerWidth - w));
      // 32px keeps icons clear of the menu bar
      const y = Math.max(32, Math.min(e.clientY - drag.current.dy, window.innerHeight - h));
      setPos({ x, y });
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

  function startDrag(e) {
    onSelect?.();
    moved.current = false;
    const rect = e.currentTarget.getBoundingClientRect();
    if (pos === null) setPos({ x: rect.left, y: rect.top });
    drag.current = {
      dx: e.clientX - (pos ? pos.x : rect.left),
      dy: e.clientY - (pos ? pos.y : rect.top),
    };
  }

  const style =
    pos === null
      ? { left: work.pos.left, top: work.pos.top, transform: "translate(-50%,-50%)" }
      : { left: pos.x, top: pos.y };

  return (
    <div
      ref={elRef}
      className={"work-icon" + (selected ? " selected" : "")}
      style={style}
      onMouseDown={startDrag}
      onDoubleClick={() => onOpen(work)}
      title={`${work.title} — ${albumCount(work)} ${albumUnit(work)}`}
    >
      <div className="work-icon__folder" style={{ background: work.tint }}>
        <img
          className="work-icon__thumb"
          src={albumCover(work)}
          alt=""
          draggable={false}
        />
        <span className="work-icon__count">{albumCount(work)}</span>
      </div>
      <div className="work-icon__label">{work.title}</div>
    </div>
  );
}
