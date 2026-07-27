import { useEffect, useRef } from "react";

function Tile({ active, onClick, icon, title, sub, wide }) {
  return (
    <button
      type="button"
      className={"cc-tile" + (wide ? " cc-tile--wide" : "") + (active ? " is-active" : "")}
      onClick={onClick}
    >
      <span className="cc-tile__icon">{icon}</span>
      <span className="cc-tile__text">
        <span className="cc-tile__title">{title}</span>
        {sub && <span className="cc-tile__sub">{sub}</span>}
      </span>
    </button>
  );
}

function Slider({ icon, value, min, max, step, onChange, label }) {
  return (
    <div className="cc-slider">
      <div className="cc-slider__label">{label}</div>
      <div className="cc-slider__track">
        <span className="cc-slider__fill" style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
        <span className="cc-slider__icon">{icon}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}

export default function ControlCenter({
  onClose,
  brightness,
  setBrightness,
  volume,
  setVolume,
  dnd,
  setDnd,
  dark,
  setDark,
  wallpaper,
  toggleWallpaper,
  wallpaperPlaying,
  togglePlayback,
  showIcons,
  setShowIcons,
  online,
  onFullscreen,
  isFullscreen,
}) {
  const ref = useRef(null);

  useEffect(() => {
    function onDown(e) {
      // Ignore the click that opened it (the menu bar button handles its own toggle)
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest(".menubar__status")) {
        onClose();
      }
    }
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="control-center" ref={ref}>
      <div className="cc-group cc-group--connect">
        <Tile
          active={online}
          title="Wi‑Fi"
          sub={online ? "Connected" : "Offline"}
          onClick={() => {}}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M2.6 8.6a14 14 0 0 1 18.8 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M6 12.1a9.2 9.2 0 0 1 12 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="12" cy="18" r="1.6" fill="currentColor" />
            </svg>
          }
        />
        <Tile
          active={dark}
          title="Appearance"
          sub={dark ? "Dark" : "Light"}
          onClick={() => setDark(!dark)}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z" />
            </svg>
          }
        />
      </div>

      <div className="cc-group cc-group--row">
        <Tile
          active={dnd}
          title="Focus"
          sub={dnd ? "On" : "Off"}
          onClick={() => setDnd(!dnd)}
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z" />
            </svg>
          }
        />
        <Tile
          active={wallpaper === "reel"}
          title="Wallpaper"
          sub={wallpaper === "reel" ? "Reel" : "Photo"}
          onClick={toggleWallpaper}
          icon={
            wallpaper === "reel" ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="4.5" width="20" height="15" rx="2.5" />
                <path d="M10 9.5l5 3-5 3z" fill="#fff" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                <circle cx="8.5" cy="10" r="1.8" fill="#fff" />
                <path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5v1.5H4z" fill="#fff" />
              </svg>
            )
          }
        />
      </div>

      {wallpaper === "reel" && (
        <div className="cc-group cc-group--bare">
          <Tile
            active={wallpaperPlaying}
            title="Reel playback"
            sub={wallpaperPlaying ? "Playing on loop" : "Paused"}
            onClick={togglePlayback}
            icon={
              wallpaperPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1.2" />
                  <rect x="14" y="4" width="4" height="16" rx="1.2" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 4.5l12 7.5-12 7.5z" />
                </svg>
              )
            }
          />
        </div>
      )}

      <div className="cc-group cc-group--row">
        <Tile
          active={showIcons}
          title="Desktop"
          sub={showIcons ? "Icons shown" : "Icons hidden"}
          onClick={() => setShowIcons(!showIcons)}
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="8" height="8" rx="2" />
              <rect x="13" y="3" width="8" height="8" rx="2" opacity="0.6" />
              <rect x="3" y="13" width="8" height="8" rx="2" opacity="0.6" />
              <rect x="13" y="13" width="8" height="8" rx="2" />
            </svg>
          }
        />
        <Tile
          active={isFullscreen}
          title="Display"
          sub={isFullscreen ? "Full screen" : "Windowed"}
          onClick={onFullscreen}
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            </svg>
          }
        />
      </div>

      <div className="cc-group">
        <Slider
          label="Display"
          min={0.35}
          max={1}
          step={0.01}
          value={brightness}
          onChange={setBrightness}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="4.5" />
              <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7" />
              </g>
            </svg>
          }
        />
      </div>

      <div className="cc-group">
        <Slider
          label="Sound"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={setVolume}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
              {volume > 0.05 && (
                <path d="M15 9.2a4 4 0 0 1 0 5.6" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" />
              )}
              {volume > 0.55 && (
                <path d="M17.6 6.8a7.6 7.6 0 0 1 0 10.4" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" />
              )}
            </svg>
          }
        />
      </div>
    </div>
  );
}
