import { useEffect, useRef, useState } from "react";

/* ---------- status icons ---------- */

/* Stands in for the Apple logo — same solid single-colour glyph treatment,
   with the lens and flash punched out via the even-odd fill rule. */
function CameraLogo() {
  return (
    <svg width="17" height="15" viewBox="0 0 20 17" fill="currentColor" fillRule="evenodd">
      <path
        d="M7.2 0h5.6l.8 2.4h3.8A2.6 2.6 0 0 1 20 5v9.4A2.6 2.6 0 0 1 17.4 17H2.6A2.6 2.6 0 0 1 0 14.4V5a2.6 2.6 0 0 1 2.6-2.6h3.8L7.2 0z
           M10 6a3.6 3.6 0 1 0 0 7.2A3.6 3.6 0 0 0 10 6z
           M16.6 4.6a.95.95 0 1 0 0 1.9.95.95 0 0 0 0-1.9z"
      />
    </svg>
  );
}

function WifiIcon({ online }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" opacity={online ? 1 : 0.4}>
      <path d="M2.6 8.6a14 14 0 0 1 18.8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5.9 12.1a9.2 9.2 0 0 1 12.2 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.2 15.6a4.4 4.4 0 0 1 5.6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="19" r="1.4" fill="currentColor" />
      {!online && <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

function BatteryIcon({ level, charging }) {
  const w = Math.max(2, Math.round(18 * level));
  const fill = charging ? "#34c75a" : level <= 0.2 ? "#fd5d5c" : "currentColor";
  return (
    <span className="menubar__battery">
      <span className="menubar__battery-pct">{Math.round(level * 100)}%</span>
      <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
        <rect x="0.6" y="0.6" width="23" height="12.8" rx="3.6" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
        <rect x="2.5" y="2.5" width={w} height="9" rx="2" fill={fill} />
        <path d="M25.4 4.8c1.2.5 1.9 1.3 1.9 2.2s-.7 1.7-1.9 2.2z" fill="currentColor" opacity="0.55" />
        {charging && <path d="M12.6 2.6l-3.4 5h2.4l-1 3.8 3.6-5.2h-2.5z" fill="#fff" />}
      </svg>
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="10.5" cy="10.5" r="6.7" stroke="currentColor" strokeWidth="2" />
      <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* Two slider tracks with knobs — no enclosing box. A bounding rect fills in at
   menu-bar size and reads as a solid dark chip instead of an outline. */
function ControlCenterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3.5 8.5h17M3.5 15.5h17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.75"
      />
      <circle cx="15.5" cy="8.5" r="3" fill="currentColor" />
      <circle cx="8.5" cy="15.5" r="3" fill="currentColor" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z" />
    </svg>
  );
}

/* ---------- live system readings ---------- */

function useBattery() {
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!navigator.getBattery) return;
    let battery;
    let alive = true;
    const update = () => {
      if (alive && battery) setState({ level: battery.level, charging: battery.charging });
    };
    navigator
      .getBattery()
      .then((b) => {
        if (!alive) return;
        battery = b;
        update();
        b.addEventListener("levelchange", update);
        b.addEventListener("chargingchange", update);
      })
      .catch(() => {});
    return () => {
      alive = false;
      if (battery) {
        battery.removeEventListener("levelchange", update);
        battery.removeEventListener("chargingchange", update);
      }
    };
  }, []);
  return state;
}

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/* ---------- menu bar ---------- */

export default function MenuBar({
  menus,
  now,
  notificationsOpen,
  onToggleNotifications,
  controlCenterOpen,
  onToggleControlCenter,
  onOpenSpotlight,
  dnd,
  controlCenter,
}) {
  const [open, setOpen] = useState(null);
  const barRef = useRef(null);
  const battery = useBattery();
  const online = useOnline();

  useEffect(() => {
    if (open === null) return;
    function onDown(e) {
      if (!barRef.current?.contains(e.target)) setOpen(null);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(null);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const time = now
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .replace(/ /g, " ");
  const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="menubar" ref={barRef}>
      <div className="menubar__left">
        {menus.map((menu) => (
          <div key={menu.id} className="menubar__menu">
            <button
              type="button"
              className={
                "menubar__title" +
                (menu.strong ? " menubar__title--strong" : "") +
                (open === menu.id ? " is-open" : "")
              }
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(open === menu.id ? null : menu.id);
              }}
              onMouseEnter={() => open !== null && setOpen(menu.id)}
            >
              {menu.id === "apple" ? <CameraLogo /> : menu.label}
            </button>

            {open === menu.id && (
              <div className="menu-dropdown">
                {menu.items.map((item, i) =>
                  item.divider ? (
                    <div className="menu-dropdown__divider" key={`d${i}`} />
                  ) : (
                    <button
                      type="button"
                      key={item.label}
                      className={"menu-item" + (item.disabled ? " is-disabled" : "")}
                      disabled={item.disabled}
                      onClick={() => {
                        setOpen(null);
                        item.action?.();
                      }}
                    >
                      <span className="menu-item__check">{item.checked ? "✓" : ""}</span>
                      <span className="menu-item__label">{item.label}</span>
                      {item.shortcut && <span className="menu-item__shortcut">{item.shortcut}</span>}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="menubar__right">
        {dnd && (
          <span className="menubar__status menubar__status--static" title="Do Not Disturb is on">
            <MoonIcon />
          </span>
        )}
        {battery && <BatteryIcon level={battery.level} charging={battery.charging} />}
        <span
          className="menubar__status menubar__status--static"
          title={online ? "Connected" : "Offline"}
        >
          <WifiIcon online={online} />
        </span>
        <button type="button" className="menubar__status" onClick={onOpenSpotlight} title="Search (⌘K)">
          <SearchIcon />
        </button>
        <button
          type="button"
          className={"menubar__status" + (controlCenterOpen ? " is-active" : "")}
          onClick={onToggleControlCenter}
          title="Control Center"
        >
          <ControlCenterIcon />
        </button>
        <button
          type="button"
          className={"menubar__clock" + (notificationsOpen ? " is-active" : "")}
          onClick={onToggleNotifications}
          title="Notification Center (⌘J)"
        >
          <span>{date}</span>
          <span>{time}</span>
        </button>
      </div>

      {controlCenterOpen && controlCenter}
    </div>
  );
}
