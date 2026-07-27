import { useRef, useState, useEffect } from "react";

const MENUBAR_H = 28;
const MIN_W = 300;
const MIN_H = 200;
/* Breathing room under a window so it never tucks behind the dock. */
const BOTTOM_GAP = 96;

export default function Window({
  title,
  initial = { x: 120, y: 120 },
  width = 360,
  zIndex = 20,
  onFocus,
  onClose,
  onMinimize,
  minimized = false,
  children,
}) {
  const [pos, setPos] = useState(initial);
  const [prevPos, setPrevPos] = useState(initial);
  const [prevWidth, setPrevWidth] = useState(width);
  const [maximized, setMaximized] = useState(false);
  const [animState, setAnimState] = useState("visible"); // "visible" | "minimizing" | "restoring"
  // `h: null` means "as tall as the content wants", capped by maxHeight below.
  const [size, setSize] = useState({ w: width, h: null });
  const drag = useRef(null);
  const resize = useRef(null);
  const elRef = useRef(null);

  useEffect(() => {
    function onMove(e) {
      if (resize.current) {
        const r = resize.current;
        const dx = e.clientX - r.x;
        const dy = e.clientY - r.y;
        const wideW = r.edge.includes("e") ? r.w + dx : r.edge.includes("w") ? r.w - dx : r.w;
        setSize({
          w: r.edge === "s" ? r.w : Math.max(MIN_W, wideW),
          h: r.edge === "e" || r.edge === "w" ? r.h : Math.max(MIN_H, r.h + dy),
        });
        // Dragging the left edge moves the window as it resizes.
        if (r.edge.includes("w")) {
          setPos((p) => ({ ...p, x: r.left + Math.min(dx, r.w - MIN_W) }));
        }
        return;
      }
      if (!drag.current) return;
      setPos({
        x: e.clientX - drag.current.dx,
        // never let a title bar slide under the menu bar
        y: Math.max(MENUBAR_H, e.clientY - drag.current.dy),
      });
    }
    function onUp() {
      drag.current = null;
      resize.current = null;
      document.body.classList.remove("is-resizing");
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  function startResize(edge) {
    return (e) => {
      if (maximized) return;
      e.preventDefault();
      e.stopPropagation();
      onFocus?.();
      const el = elRef.current;
      resize.current = {
        edge,
        x: e.clientX,
        y: e.clientY,
        w: el.offsetWidth,
        h: el.offsetHeight,
        left: pos.x,
      };
      document.body.classList.add("is-resizing");
    };
  }

  // Handle minimize/restore transitions
  useEffect(() => {
    if (minimized && animState === "visible") {
      setAnimState("minimizing");
    } else if (!minimized && animState === "minimizing") {
      setAnimState("restoring");
      const t = setTimeout(() => setAnimState("visible"), 350);
      return () => clearTimeout(t);
    }
  }, [minimized]);

  // After minimizing animation ends, keep it hidden
  useEffect(() => {
    if (animState === "restoring") {
      const t = setTimeout(() => setAnimState("visible"), 350);
      return () => clearTimeout(t);
    }
  }, [animState]);

  function startDrag(e) {
    if (animState !== "visible" || maximized) return;
    onFocus?.();
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
  }

  function handleMinimize(e) {
    e.stopPropagation();
    onMinimize?.();
  }

  function handleExpand(e) {
    e.stopPropagation();
    if (!maximized) {
      setPrevPos({ ...pos });
      setPrevWidth(currentWidth);
      setMaximized(true);
    } else {
      setPos(prevPos);
      setMaximized(false);
    }
  }

  // Compute the dock target (bottom center of viewport)
  const dockTargetX = window.innerWidth / 2;
  const dockTargetY = window.innerHeight;

  const animClass =
    animState === "minimizing"
      ? " window--minimizing"
      : animState === "restoring"
      ? " window--restoring"
      : "";

  // When fully minimized (animation done), hide
  if (minimized && animState === "minimizing") {
    // Show during animation
  }

  const isHidden = minimized && animState !== "restoring";

  const currentLeft = maximized ? 0 : pos.x;
  const currentTop = maximized ? MENUBAR_H : pos.y;
  const currentWidth = maximized ? window.innerWidth : size.w;
  const currentHeight = maximized ? window.innerHeight - MENUBAR_H : size.h ?? undefined;
  /* Without this the window grows past the bottom of the screen and its body
     never gets a chance to scroll. */
  const maxHeight = maximized ? undefined : `calc(100vh - ${currentTop + BOTTOM_GAP}px)`;

  const transformOrigin = `${dockTargetX - currentLeft}px ${dockTargetY - currentTop}px`;

  return (
    <div
      ref={elRef}
      className={"window" + animClass + (maximized ? " window--maximized" : "")}
      style={{
        left: currentLeft,
        top: currentTop,
        width: currentWidth,
        height: currentHeight,
        maxHeight,
        zIndex: isHidden && animState !== "minimizing" ? -1 : zIndex,
        transformOrigin,
        visibility:
          isHidden && animState !== "minimizing" ? "hidden" : "visible",
        borderRadius: maximized ? 0 : undefined,
      }}
      onMouseDown={() => onFocus?.()}
      onAnimationEnd={() => {
        if (animState === "minimizing") {
          // animation done, keep minimized
        }
        if (animState === "restoring") {
          setAnimState("visible");
        }
      }}
    >
      <div className="window__bar" onMouseDown={startDrag}>
        <div className="traffic">
          <span className="close" onClick={onClose} />
          <span className="reduce" onClick={handleMinimize} />
          <span className="expand" onClick={handleExpand} />
        </div>
        <div className="window__title">{title}</div>
      </div>
      <div className="window__body">{children}</div>

      {!maximized && (
        <>
          <span className="window__resize window__resize--e" onMouseDown={startResize("e")} />
          <span className="window__resize window__resize--w" onMouseDown={startResize("w")} />
          <span className="window__resize window__resize--s" onMouseDown={startResize("s")} />
          <span
            className="window__resize window__resize--se"
            onMouseDown={startResize("se")}
            title="Resize"
          />
        </>
      )}
    </div>
  );
}
