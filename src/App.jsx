import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Dock from "./components/Dock.jsx";
import WorkIcon from "./components/WorkIcon.jsx";
import Window from "./components/Window.jsx";
import MenuBar, { useClock } from "./components/MenuBar.jsx";
import ControlCenter from "./components/ControlCenter.jsx";
import NotificationCenter from "./components/NotificationCenter.jsx";
import Spotlight from "./components/Spotlight.jsx";
import {
  AboutMac,
  Album,
  CalendarApp,
  Compose,
  Gallery,
  Help,
  Trash,
} from "./components/AppWindows.jsx";
import {
  BehanceIcon,
  CalendarIcon,
  ContactsIcon,
  FinderIcon,
  HelpIcon,
  InstagramIcon,
  MailIcon,
  NotesIcon,
  PhotosIcon,
  TrashIcon,
  XIcon,
} from "./components/AppIcons.jsx";
import { about, albums, notes, seedNotifications, socials } from "./data.js";

const BUCKETS = 10;

/* Static windows. Folder windows are created on demand as `work-<slug>`. */
const WINDOW_DEFS = {
  finder: { title: "Portfolio", width: 520, initial: { x: 130, y: 84 } },
  about: { title: "About Me", width: 380, initial: { x: 150, y: 96 } },
  notes: { title: "Notes", width: 340, initial: { x: 570, y: 132 } },
  gallery: { title: "Photos", width: 600, initial: { x: 180, y: 74 } },
  contact: { title: "New Message", width: 470, initial: { x: 330, y: 148 } },
  calendar: { title: "Calendar", width: 470, initial: { x: 250, y: 110 } },
  aboutmac: { title: "About This Mac", width: 390, initial: { x: 420, y: 118 } },
  help: { title: "Portfolio Help", width: 430, initial: { x: 350, y: 124 } },
  trash: { title: "Trash", width: 450, initial: { x: 300, y: 168 } },
};

export default function App() {
  /* ----- window manager ----- */
  const [selected, setSelected] = useState([]);
  const [openWindows, setOpenWindows] = useState([]);
  const [minimized, setMinimized] = useState({});
  const [topZ, setTopZ] = useState(20);
  const [zmap, setZmap] = useState({});
  const [focused, setFocused] = useState(null);

  /* ----- system chrome ----- */
  const now = useClock();
  const [ncOpen, setNcOpen] = useState(false);
  const [ccOpen, setCcOpen] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [volume, setVolume] = useState(0);
  const [dnd, setDnd] = useState(false);
  const [dark, setDark] = useState(false);
  const [showIcons, setShowIcons] = useState(true);
  const [wallpaper, setWallpaper] = useState("photo"); // "photo" | "reel"
  const [wallpaperPlaying, setWallpaperPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [asleep, setAsleep] = useState(false);

  /* ----- notifications + trash ----- */
  const [notifications, setNotifications] = useState(seedNotifications);
  const [trashed, setTrashed] = useState([]);

  /* ----- live session metrics ----- */
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [buckets, setBuckets] = useState(() => Array(BUCKETS).fill(0));

  const videoRef = useRef(null);

  /* ---------------- window helpers ---------------- */

  const focus = useCallback((id) => {
    setFocused(id);
    setTopZ((z) => {
      const next = z + 1;
      setZmap((m) => ({ ...m, [id]: next }));
      return next;
    });
  }, []);

  const openWindow = useCallback(
    (id) => {
      setOpenWindows((w) => (w.includes(id) ? w : [...w, id]));
      setMinimized((m) => ({ ...m, [id]: false }));
      focus(id);
    },
    [focus]
  );

  const toggleWindow = useCallback(
    (id) => {
      setOpenWindows((w) => {
        if (!w.includes(id)) {
          setMinimized((m) => ({ ...m, [id]: false }));
          focus(id);
          return [...w, id];
        }
        setMinimized((m) => {
          if (m[id]) {
            focus(id);
            return { ...m, [id]: false };
          }
          return { ...m, [id]: true };
        });
        return w;
      });
    },
    [focus]
  );

  const closeWindow = useCallback(
    (id) => {
      setOpenWindows((w) => w.filter((x) => x !== id));
      setMinimized((m) => ({ ...m, [id]: false }));
      setFocused((f) => (f === id ? null : f));
    },
    []
  );

  const minimizeWindow = useCallback((id) => {
    setMinimized((m) => ({ ...m, [id]: true }));
  }, []);

  const openWork = useCallback((album) => openWindow(`work-${album.slug}`), [openWindow]);

  const windowTitle = useCallback((id) => {
    if (id?.startsWith("work-")) {
      return albums.find((a) => `work-${a.slug}` === id)?.title || "Folder";
    }
    return WINDOW_DEFS[id]?.title || "Finder";
  }, []);

  const activeApp = focused && openWindows.includes(focused) ? windowTitle(focused) : "Finder";

  /* ---------------- live metrics ---------------- */

  useEffect(() => {
    const tick = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    const roll = setInterval(() => setBuckets((b) => [...b.slice(1), 0]), 60000);
    return () => {
      clearInterval(tick);
      clearInterval(roll);
    };
  }, []);

  useEffect(() => {
    let lastMove = 0;
    const bump = () =>
      setBuckets((b) => {
        const next = [...b];
        next[next.length - 1] += 1;
        return next;
      });
    const onMove = () => {
      const t = Date.now();
      if (t - lastMove > 1000) {
        lastMove = t;
        bump();
      }
    };
    window.addEventListener("mousedown", bump);
    window.addEventListener("keydown", bump);
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousedown", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  /* ---------------- system effects ---------------- */

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (wallpaperPlaying) v.play().catch(() => {});
    else v.pause();
  }, [wallpaperPlaying, wallpaper]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = volume === 0;
  }, [volume, wallpaper]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  /* ---------------- keyboard ---------------- */

  useEffect(() => {
    function onKey(e) {
      const mod = e.metaKey || e.ctrlKey;
      const typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName);

      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSpotlightOpen((s) => !s);
      } else if (mod && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setNcOpen((n) => !n);
      } else if (mod && e.key === "/") {
        e.preventDefault();
        openWindow("help");
      } else if (e.key === "Escape" && !typing) {
        if (spotlightOpen) setSpotlightOpen(false);
        else if (ccOpen) setCcOpen(false);
        else if (ncOpen) setNcOpen(false);
        else if (asleep) setAsleep(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spotlightOpen, ccOpen, ncOpen, asleep, openWindow]);

  /* ---------------- notifications ---------------- */

  const dismissNotification = useCallback((id) => {
    setNotifications((list) => {
      const hit = list.find((n) => n.id === id);
      if (hit) setTrashed((t) => (t.some((x) => x.id === id) ? t : [...t, hit]));
      return list.filter((n) => n.id !== id);
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications((list) => {
      setTrashed((t) => [...t, ...list.filter((n) => !t.some((x) => x.id === n.id))]);
      return [];
    });
  }, []);

  const restoreNotification = useCallback((id) => {
    setTrashed((t) => {
      const hit = t.find((n) => n.id === id);
      if (hit) setNotifications((list) => (list.some((x) => x.id === id) ? list : [hit, ...list]));
      return t.filter((n) => n.id !== id);
    });
  }, []);

  /* ---------------- dock ---------------- */

  const dockApps = useMemo(() => {
    /* Every icon paints its own tile, so the slot behind it stays transparent. */
    const app = (id, label, icon, target) => ({
      id,
      label,
      color: "transparent",
      icon,
      running: openWindows.includes(target),
      onClick: () => toggleWindow(target),
    });

    const socialIcon = {
      Instagram: <InstagramIcon />,
      X: <XIcon />,
      Behance: <BehanceIcon />,
    };

    return [
      app("finder", "Finder", <FinderIcon />, "finder"),
      app("photos", "Photos", <PhotosIcon />, "gallery"),
      app("about", "About Me", <ContactsIcon />, "about"),
      app("notes", "Notes", <NotesIcon />, "notes"),
      app("mail", "Mail", <MailIcon />, "contact"),
      app("calendar", "Calendar", <CalendarIcon now={now} />, "calendar"),
      app("help", "Help", <HelpIcon />, "help"),
      { divider: true },
      ...socials.map((s) => ({
        id: `social-${s.label}`,
        label: s.label,
        color: "transparent",
        href: s.url,
        icon: socialIcon[s.label],
      })),
      { divider: true },
      {
        id: "trash",
        label: trashed.length ? `Trash (${trashed.length})` : "Trash",
        color: "transparent",
        icon: <TrashIcon full={trashed.length > 0} />,
        running: openWindows.includes("trash"),
        onClick: () => toggleWindow("trash"),
      },
    ];
  }, [openWindows, toggleWindow, now, trashed.length]);

  const spotlightApps = useMemo(
    () =>
      Object.entries(WINDOW_DEFS).map(([id, def]) => ({
        id,
        label: def.title,
        hint: "Application",
        color: "linear-gradient(135deg,#dfe7f5,#aebfd8)",
        open: () => openWindow(id),
      })),
    [openWindow]
  );

  /* ---------------- menus ---------------- */

  const menus = useMemo(() => {
    const openIds = openWindows;
    const hasFocus = focused && openIds.includes(focused);

    return [
      {
        id: "apple",
        label: "",
        items: [
          { label: "About This Mac", action: () => openWindow("aboutmac") },
          { divider: true },
          { label: "System Preferences…", action: () => setCcOpen(true) },
          { label: "Portfolio Help", shortcut: "⌘/", action: () => openWindow("help") },
          { divider: true },
          { label: "Sleep", action: () => setAsleep(true) },
          { label: "Restart…", action: () => window.location.reload() },
          { label: "Lock Screen", action: () => setAsleep(true) },
        ],
      },
      {
        id: "app",
        label: activeApp,
        strong: true,
        items: [
          { label: `About ${activeApp}`, action: () => openWindow("aboutmac") },
          { divider: true },
          {
            label: "Hide Window",
            disabled: !hasFocus,
            action: () => hasFocus && minimizeWindow(focused),
          },
          {
            label: "Close Window",
            disabled: !hasFocus,
            action: () => hasFocus && closeWindow(focused),
          },
        ],
      },
      {
        id: "file",
        label: "File",
        items: [
          { label: "Open Photos", action: () => openWindow("gallery") },
          { label: "New Message", action: () => openWindow("contact") },
          { label: "Open Calendar", action: () => openWindow("calendar") },
          { divider: true },
          { label: "Find…", shortcut: "⌘K", action: () => setSpotlightOpen(true) },
          { divider: true },
          {
            label: "Close All Windows",
            disabled: openIds.length === 0,
            action: () => {
              setOpenWindows([]);
              setFocused(null);
            },
          },
        ],
      },
      {
        id: "edit",
        label: "Edit",
        items: [
          {
            label: "Copy Email Address",
            action: () => navigator.clipboard?.writeText(about.email).catch(() => {}),
          },
          { divider: true },
          { label: "Select All Icons", action: () => setSelected(albums.map((a) => a.slug)) },
          {
            label: "Deselect All",
            disabled: selected.length === 0,
            action: () => setSelected([]),
          },
        ],
      },
      {
        id: "view",
        label: "View",
        items: [
          { label: "Show Desktop Icons", checked: showIcons, action: () => setShowIcons(!showIcons) },
          {
            label: "Wallpaper: Photo",
            checked: wallpaper === "photo",
            action: () => setWallpaper("photo"),
          },
          {
            label: "Wallpaper: Reel",
            checked: wallpaper === "reel",
            action: () => setWallpaper("reel"),
          },
          {
            label: "Play Reel",
            checked: wallpaperPlaying,
            disabled: wallpaper !== "reel",
            action: () => setWallpaperPlaying((p) => !p),
          },
          { label: "Dark Appearance", checked: dark, action: () => setDark(!dark) },
          { divider: true },
          {
            label: isFullscreen ? "Exit Full Screen" : "Enter Full Screen",
            action: toggleFullscreen,
          },
        ],
      },
      {
        id: "window",
        label: "Window",
        items: [
          {
            label: "Minimize",
            disabled: !hasFocus,
            action: () => hasFocus && minimizeWindow(focused),
          },
          {
            label: "Minimize All",
            disabled: openIds.length === 0,
            action: () => setMinimized(Object.fromEntries(openIds.map((id) => [id, true]))),
          },
          {
            label: "Bring All to Front",
            disabled: openIds.length === 0,
            action: () => {
              setMinimized({});
              openIds.forEach((id) => focus(id));
            },
          },
          { divider: true },
          ...(openIds.length
            ? openIds.map((id) => ({
                label: windowTitle(id),
                checked: id === focused && !minimized[id],
                action: () => {
                  setMinimized((m) => ({ ...m, [id]: false }));
                  focus(id);
                },
              }))
            : [{ label: "No Open Windows", disabled: true }]),
        ],
      },
      {
        id: "help",
        label: "Help",
        items: [
          { label: "Portfolio Help", shortcut: "⌘/", action: () => openWindow("help") },
          { label: "Notification Center", shortcut: "⌘J", action: () => setNcOpen((n) => !n) },
          { divider: true },
          { label: `Email ${about.name}`, action: () => openWindow("contact") },
        ],
      },
    ];
  }, [
    activeApp,
    closeWindow,
    dark,
    focus,
    focused,
    isFullscreen,
    minimized,
    minimizeWindow,
    openWindow,
    openWindows,
    selected.length,
    showIcons,
    toggleFullscreen,
    wallpaper,
    wallpaperPlaying,
    windowTitle,
  ]);

  /* ---------------- window content ---------------- */

  function renderContent(id) {
    switch (id) {
      case "about":
        return (
          <div className="about">
            <img className="about__portrait" src={about.portrait} alt={about.name} />
            <div className="about__name">{about.name}</div>
            <div className="about__role">{about.role}</div>
            <p className="about__bio">{about.bio}</p>
            <div className="mono-label">Based</div>
            <p className="about__bio">{about.based}</p>

            <div className="mono-label">Contact</div>
            <a className="btn" href={`mailto:${about.email}`}>
              {about.email}
            </a>
          </div>
        );
      case "notes":
        return notes.map((n) => (
          <div className="note" key={n.title}>
            <div className="note__title">{n.title}</div>
            <div className="note__meta">{n.meta}</div>
            <div className="note__text">{n.text}</div>
          </div>
        ));
      case "finder":
        return <Gallery onOpenWork={openWork} view="list" />;
      case "gallery":
        return <Gallery onOpenWork={openWork} />;
      case "contact":
        return <Compose />;
      case "calendar":
        return <CalendarApp now={now} />;
      case "aboutmac":
        return <AboutMac sessionSeconds={sessionSeconds} />;
      case "help":
        return <Help />;
      case "trash":
        return (
          <Trash items={trashed} onRestore={restoreNotification} onEmpty={() => setTrashed([])} />
        );
      default: {
        const album = albums.find((a) => `work-${a.slug}` === id);
        if (!album) return null;
        return <Album album={album} />;
      }
    }
  }

  const overlayOpacity = 0.18 + (1 - brightness) * 0.62;

  return (
    <div
      className={"desktop" + (ncOpen ? " nc-open" : "")}
      onMouseDown={(e) => {
        if (
          e.target.classList.contains("desktop") ||
          e.target.classList.contains("desktop__overlay")
        ) {
          setSelected([]);
          if (ncOpen) setNcOpen(false);
        }
      }}
    >
      {wallpaper === "reel" ? (
        <video
          ref={videoRef}
          className="desktop__bg"
          src="/Final%20Reel.mp4"
          poster="/123.png"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
      ) : (
        <div className="desktop__bg desktop__bg--photo" />
      )}
      <div className="desktop__overlay" style={{ opacity: overlayOpacity }} />

      <MenuBar
        menus={menus}
        now={now}
        dnd={dnd}
        notificationsOpen={ncOpen}
        onToggleNotifications={() => setNcOpen((n) => !n)}
        controlCenterOpen={ccOpen}
        onToggleControlCenter={() => setCcOpen((c) => !c)}
        onOpenSpotlight={() => setSpotlightOpen(true)}
        controlCenter={
          <ControlCenter
            onClose={() => setCcOpen(false)}
            brightness={brightness}
            setBrightness={setBrightness}
            volume={volume}
            setVolume={setVolume}
            dnd={dnd}
            setDnd={setDnd}
            dark={dark}
            setDark={setDark}
            wallpaper={wallpaper}
            toggleWallpaper={() => setWallpaper((w) => (w === "photo" ? "reel" : "photo"))}
            wallpaperPlaying={wallpaperPlaying}
            togglePlayback={() => setWallpaperPlaying((p) => !p)}
            showIcons={showIcons}
            setShowIcons={setShowIcons}
            online={navigator.onLine}
            onFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
          />
        }
      />

      {showIcons &&
        albums.map((a) => (
          <WorkIcon
            key={a.slug}
            work={a}
            selected={selected.includes(a.slug)}
            onSelect={() => setSelected([a.slug])}
            onOpen={openWork}
          />
        ))}

      {openWindows.map((id) => {
        const isWork = id.startsWith("work-");
        const def = isWork
          ? { title: windowTitle(id), width: 560, initial: { x: 210, y: 90 } }
          : WINDOW_DEFS[id];
        if (!def) return null;
        return (
          <Window
            key={id}
            title={def.title}
            initial={def.initial}
            width={def.width}
            zIndex={zmap[id] || 20}
            minimized={!!minimized[id]}
            onFocus={() => focus(id)}
            onClose={() => closeWindow(id)}
            onMinimize={() => minimizeWindow(id)}
          >
            {renderContent(id)}
          </Window>
        );
      })}

      <NotificationCenter
        open={ncOpen}
        now={now}
        dnd={dnd}
        notifications={notifications}
        onDismiss={dismissNotification}
        onClearAll={clearAllNotifications}
        onOpenWindow={openWindow}
        onOpenWork={openWork}
        sessionSeconds={sessionSeconds}
        buckets={buckets}
      />

      <Spotlight
        open={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        apps={spotlightApps}
        onOpenWork={openWork}
        onOpenWindow={openWindow}
      />

      <Dock apps={dockApps} />

      {asleep && (
        <div
          className="sleep-screen"
          onClick={() => setAsleep(false)}
          onMouseMove={() => setAsleep(false)}
        >
          <div className="sleep-screen__time">
            {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </div>
          <div className="sleep-screen__date">
            {now.toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="sleep-screen__hint">Click anywhere to wake</div>
        </div>
      )}
    </div>
  );
}
