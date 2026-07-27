import { useEffect, useState } from "react";
import { about, albums, events } from "../data.js";
import { albumCover } from "./WorkIcon.jsx";

/* ---------- Notifications ---------- */

function NotificationCard({ n, onOpen, onDismiss }) {
  return (
    <div className="nc-card nc-notif" onClick={() => onOpen(n.target)}>
      <div className="nc-notif__head">
        <span className="nc-notif__app-icon" style={{ background: n.appColor }} />
        <span className="nc-notif__app">{n.app}</span>
        <span className="nc-notif__ago">{n.ago}</span>
        <button
          type="button"
          className="nc-notif__close"
          title="Clear"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(n.id);
          }}
        >
          ×
        </button>
      </div>
      <div className="nc-notif__title">{n.title}</div>
      <div className="nc-notif__body">{n.body}</div>
    </div>
  );
}

/* ---------- Calendar ---------- */

function CalendarWidget({ now, onOpen }) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const first = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const upcoming = events
    .filter((e) => e.day >= today)
    .slice(0, 2)
    .concat(events.filter((e) => e.day < today).slice(0, 2))
    .slice(0, 2);

  return (
    <div className="nc-card nc-cal" onClick={() => onOpen("calendar")}>
      <div className="nc-cal__events">
        {upcoming.map((e) => (
          <div className="nc-cal__event" key={e.title}>
            <span className="nc-cal__bar" style={{ background: e.color }} />
            <span>
              <span className="nc-cal__event-title">{e.title}</span>
              <span className="nc-cal__event-time">{e.time}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="nc-cal__grid-wrap">
        <div className="nc-cal__month">
          {now.toLocaleDateString([], { month: "long" }).toUpperCase()}
        </div>
        <div className="nc-cal__grid">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span className="nc-cal__dow" key={i}>
              {d}
            </span>
          ))}
          {cells.map((d, i) => (
            <span
              key={i}
              className={
                "nc-cal__day" +
                (d === today ? " is-today" : "") +
                (d && events.some((e) => e.day === d) ? " has-event" : "")
              }
            >
              {d || ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Session activity (real, measured this visit) ---------- */

function ActivityWidget({ seconds, buckets }) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const big = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  const peak = Math.max(1, ...buckets);

  return (
    <div className="nc-card nc-activity">
      <div className="nc-activity__value">{big}</div>
      <div className="nc-activity__label">on this desktop</div>
      <div className="nc-activity__chart">
        {buckets.map((b, i) => (
          <span
            key={i}
            className={"nc-activity__bar" + (i === buckets.length - 1 ? " is-now" : "")}
            style={{ height: `${Math.max(4, (b / peak) * 100)}%` }}
          />
        ))}
      </div>
      <div className="nc-activity__axis">
        <span>−{buckets.length}m</span>
        <span>now</span>
      </div>
    </div>
  );
}

/* ---------- On This Day ---------- */

/* Every frame in every folder, so the widget rotates through the whole archive
   rather than just the five covers. */
const ALL_FRAMES = albums.flatMap((a) =>
  (a.photos.length ? a.photos : [{ src: albumCover(a), caption: a.title }]).map((p) => ({
    ...p,
    album: a,
  }))
);

function OnThisDayWidget({ now, onOpenWork }) {
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const frame = ALL_FRAMES[dayOfYear % ALL_FRAMES.length];
  return (
    <div className="nc-card nc-otd" onClick={() => onOpenWork(frame.album)}>
      <img className="nc-otd__img" src={frame.src} alt={frame.caption} />
      <div className="nc-otd__overlay">
        <div className="nc-otd__kicker">ON THIS DAY</div>
        <div className="nc-otd__title">{frame.caption}</div>
        <div className="nc-otd__meta">
          {frame.album.title} · {frame.album.year}
        </div>
      </div>
    </div>
  );
}

/* ---------- Weather (live, Open-Meteo) ---------- */

const WEATHER_TEXT = {
  0: "Clear", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow",
  75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm",
};

function useWeather() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const { lat, lon } = about.coords;
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code&hourly=precipitation_probability&forecast_days=1&timezone=auto`;
    const ctrl = new AbortController();
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((j) => {
        const hourNow = new Date().getHours();
        setData({
          temp: Math.round(j.current.temperature_2m),
          code: j.current.weather_code,
          precip: (j.hourly?.precipitation_probability || []).slice(hourNow, hourNow + 8),
        });
      })
      .catch((e) => {
        if (e.name !== "AbortError") setFailed(true);
      });
    return () => ctrl.abort();
  }, []);

  return { data, failed };
}

function WeatherWidget() {
  const { data, failed } = useWeather();

  if (failed)
    return (
      <div className="nc-card nc-weather">
        <div className="nc-weather__city">{about.coords.city}</div>
        <div className="nc-weather__unavailable">Weather unavailable — offline</div>
      </div>
    );

  if (!data)
    return (
      <div className="nc-card nc-weather">
        <div className="nc-weather__city">{about.coords.city}</div>
        <div className="nc-weather__unavailable">Loading…</div>
      </div>
    );

  const peak = Math.max(10, ...data.precip);
  return (
    <div className="nc-card nc-weather">
      <div className="nc-weather__top">
        <div>
          <div className="nc-weather__city">{about.coords.city}</div>
          <div className="nc-weather__temp">{data.temp}°</div>
        </div>
        <div className="nc-weather__right">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
            <path d="M7 18h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.2A3.5 3.5 0 0 0 7 18z" />
          </svg>
          <div className="nc-weather__desc">{WEATHER_TEXT[data.code] || "—"}</div>
        </div>
      </div>
      <div className="nc-weather__label">Precipitation, next 8 hours</div>
      <div className="nc-weather__chart">
        {data.precip.map((p, i) => (
          <span key={i} className="nc-weather__bar" style={{ height: `${(p / peak) * 100}%` }} />
        ))}
      </div>
      <div className="nc-weather__axis">
        <span>Now</span>
        <span>+4h</span>
        <span>+8h</span>
      </div>
    </div>
  );
}

/* ---------- Panel ---------- */

export default function NotificationCenter({
  open,
  now,
  notifications,
  onDismiss,
  onClearAll,
  onOpenWindow,
  onOpenWork,
  sessionSeconds,
  buckets,
  dnd,
}) {
  return (
    <div className={"notification-center" + (open ? " is-open" : "")}>
      <div className="nc-scroll">
        {dnd && (
          <div className="nc-card nc-dnd">
            <strong>Focus is on</strong>
            <span>New notifications are being silenced.</span>
          </div>
        )}

        {notifications.length > 0 ? (
          <>
            {notifications.map((n) => (
              <NotificationCard key={n.id} n={n} onOpen={onOpenWindow} onDismiss={onDismiss} />
            ))}
            <button type="button" className="nc-clear" onClick={onClearAll}>
              Clear All
            </button>
          </>
        ) : (
          <div className="nc-card nc-empty">No New Notifications</div>
        )}

        <CalendarWidget now={now} onOpen={onOpenWindow} />

        <div className="nc-row">
          <ActivityWidget seconds={sessionSeconds} buckets={buckets} />
          <OnThisDayWidget now={now} onOpenWork={onOpenWork} />
        </div>

        <WeatherWidget />
      </div>
    </div>
  );
}
