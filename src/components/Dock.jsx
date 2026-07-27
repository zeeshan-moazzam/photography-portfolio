import { useRef, useState } from "react";

const BASE = 52;
const MAX_SCALE = 1.55;
const RANGE = 110; // px of cursor influence either side

function DockButton({ app, mouseX }) {
  const ref = useRef(null);
  let scale = 1;

  if (mouseX !== null && ref.current) {
    const rect = ref.current.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const dist = Math.abs(mouseX - center);
    if (dist < RANGE) {
      // cosine falloff — smooth, like the real dock
      scale = 1 + (MAX_SCALE - 1) * (Math.cos((dist / RANGE) * Math.PI) + 1) * 0.5;
    }
  }

  const inner = (
    <div className="dock__slot" style={{ width: BASE * scale }}>
      <div
        ref={ref}
        className="dock__item"
        style={{ width: BASE * scale, height: BASE * scale }}
        onClick={app.onClick}
      >
        <div className="dock__icon" style={{ background: app.color }}>
          {app.icon}
        </div>
        <span className="dock__tooltip">{app.label}</span>
      </div>
      <span className={"dock__dot" + (app.running ? " is-on" : "")} />
    </div>
  );

  if (app.href) {
    return (
      <a href={app.href} target="_blank" rel="noreferrer" className="dock__link">
        {inner}
      </a>
    );
  }
  return inner;
}

export default function Dock({ apps }) {
  const [mouseX, setMouseX] = useState(null);

  return (
    <div className="dock-wrap">
      <div
        className="dock"
        onMouseMove={(e) => setMouseX(e.clientX)}
        onMouseLeave={() => setMouseX(null)}
      >
        {apps.map((app, i) =>
          app.divider ? (
            <div className="dock__divider" key={`div-${i}`} />
          ) : (
            <DockButton key={app.id} app={app} mouseX={mouseX} />
          )
        )}
      </div>
    </div>
  );
}
