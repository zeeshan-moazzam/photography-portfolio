/* Dock / app glyphs, drawn Big Sur style.

   Each icon paints its own full-bleed 52×52 tile — background included — so the
   gradients match the real macOS artwork. `.dock__icon` clips them to the
   rounded-square shape, which is why none of these round their own corners. */

const Tile = ({ children, ...rest }) => (
  <svg viewBox="0 0 52 52" width="100%" height="100%" {...rest}>
    {children}
  </svg>
);

export function FinderIcon() {
  return (
    <Tile>
      <defs>
        <linearGradient id="fi-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4aabf7" />
          <stop offset="1" stopColor="#1a6fd4" />
        </linearGradient>
        <linearGradient id="fi-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f9ff" />
          <stop offset="1" stopColor="#c2dcf6" />
        </linearGradient>
      </defs>
      <rect width="52" height="52" fill="url(#fi-r)" />
      <rect width="26" height="52" fill="url(#fi-l)" />
      {/* Two eyes and one long smile that runs across both halves. */}
      <rect x="14.5" y="16" width="3.2" height="9" rx="1.6" fill="#173a5e" />
      <rect x="34.3" y="16" width="3.2" height="9" rx="1.6" fill="#173a5e" />
      <path
        d="M11 30c3 1.6 5.4 2.4 7.6 2.4 2.6 0 4.6-1 5.6-2.7v9.6M26 30c1 1.7 3 2.7 5.6 2.7 2.2 0 4.6-.8 7.6-2.4"
        stroke="#173a5e"
        strokeWidth="2.3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Tile>
  );
}

export function PhotosIcon() {
  /* Eight petals in a pinwheel, multiplied where they overlap. */
  const petals = [
    "#f8b81e", "#f26d21", "#e8382e", "#c2258f",
    "#6f3fbb", "#2d6fd0", "#1aa4c8", "#5cba47",
  ];
  return (
    <Tile>
      <rect width="52" height="52" fill="#fdfdfd" />
      <g style={{ mixBlendMode: "multiply" }}>
        {petals.map((c, i) => (
          <ellipse
            key={c}
            cx="26"
            cy="16.5"
            rx="6"
            ry="10.4"
            fill={c}
            opacity="0.82"
            transform={`rotate(${i * 45} 26 26)`}
          />
        ))}
      </g>
    </Tile>
  );
}

export function NotesIcon() {
  return (
    <Tile>
      <defs>
        <linearGradient id="nt-y" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe15c" />
          <stop offset="1" stopColor="#ffcb14" />
        </linearGradient>
      </defs>
      <rect width="52" height="52" fill="#fdfdfb" />
      <rect width="52" height="15" fill="url(#nt-y)" />
      <path
        d="M9 24.5h34M9 31h34M9 37.5h22"
        stroke="#d9d9d4"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Tile>
  );
}

export function MailIcon() {
  return (
    <Tile>
      <defs>
        <linearGradient id="ml-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fc9ff" />
          <stop offset="1" stopColor="#1274f0" />
        </linearGradient>
      </defs>
      <rect width="52" height="52" fill="url(#ml-b)" />
      <rect x="8" y="15" width="36" height="22" rx="4" fill="#fff" />
      <path
        d="M9.6 17.6 26 29.4l16.4-11.8"
        stroke="#1274f0"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Tile>
  );
}

export function CalendarIcon({ now }) {
  /* macOS shows the weekday in red over a large black date. */
  const weekday = now.toLocaleDateString([], { weekday: "short" }).toUpperCase();
  return (
    <div className="dock__cal">
      <span className="dock__cal-dow">{weekday}</span>
      <span className="dock__cal-day">{now.getDate()}</span>
    </div>
  );
}

export function ContactsIcon() {
  /* Contacts is a bound book: tan spine, white pages, grey silhouette. */
  return (
    <Tile>
      <defs>
        <linearGradient id="ct-s" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c79a5b" />
          <stop offset="1" stopColor="#a97c42" />
        </linearGradient>
      </defs>
      <rect width="52" height="52" fill="#fbfbfb" />
      <rect width="11" height="52" fill="url(#ct-s)" />
      <circle cx="32" cy="20.5" r="7" fill="#9b9ba1" />
      <path d="M19.5 40c0-6.6 5.6-10.4 12.5-10.4S44.5 33.4 44.5 40z" fill="#9b9ba1" />
    </Tile>
  );
}

export function InstagramIcon() {
  return (
    <Tile>
      <defs>
        <linearGradient id="ig-g" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#ffd521" />
          <stop offset="0.28" stopColor="#f50000" />
          <stop offset="0.62" stopColor="#b900b4" />
          <stop offset="1" stopColor="#5b6def" />
        </linearGradient>
      </defs>
      <rect width="52" height="52" fill="url(#ig-g)" />
      <rect x="13" y="13" width="26" height="26" rx="8" stroke="#fff" strokeWidth="2.6" fill="none" />
      <circle cx="26" cy="26" r="6.6" stroke="#fff" strokeWidth="2.6" fill="none" />
      <circle cx="34.2" cy="18" r="1.9" fill="#fff" />
    </Tile>
  );
}

export function XIcon() {
  return (
    <Tile>
      <rect width="52" height="52" fill="#000" />
      <g transform="translate(13 13) scale(1.083)">
        <path
          d="M13.9 10.6 21.4 2h-1.8l-6.5 7.5L7.9 2H2l7.9 11.4L2 22.4h1.8l6.9-7.9 5.5 7.9H22l-8.1-11.8zm-2.4 2.8-.8-1.1L4.4 3.3h2.7l5.1 7.3.8 1.1 6.6 9.5h-2.7l-5.4-7.8z"
          fill="#fff"
        />
      </g>
    </Tile>
  );
}

export function BehanceIcon() {
  return (
    <Tile>
      <rect width="52" height="52" fill="#1769ff" />
      <g transform="translate(3 14) scale(1.92)">
        <path
          d="M8.3 11.4c.9-.45 1.4-1.2 1.4-2.3 0-2.1-1.55-2.85-3.4-2.85H1v11.5h5.5c2 0 3.85-.95 3.85-3.2 0-1.4-.65-2.55-2.05-3.15zM3.55 8.2h2.3c.9 0 1.65.25 1.65 1.25 0 .95-.6 1.3-1.5 1.3h-2.45V8.2zm2.6 7.6H3.55v-3h2.65c1.05 0 1.75.45 1.75 1.55 0 1.1-.8 1.45-1.8 1.45zM19.4 8.1h-4.9V6.85h4.9V8.1zm3.55 6.05c0-2.65-1.5-4.85-4.3-4.85-2.7 0-4.55 2-4.55 4.65 0 2.75 1.75 4.6 4.55 4.6 2.1 0 3.5-.95 4.15-2.95h-2.15c-.25.75-1.05 1.15-1.9 1.15-1.35 0-2.05-.8-2.05-2.1h6.2c.03-.15.05-.35.05-.5zm-6.2-1.1c.05-1.1.8-1.85 1.9-1.85 1.15 0 1.75.65 1.85 1.85h-3.75z"
          fill="#fff"
        />
      </g>
    </Tile>
  );
}

export function TrashIcon({ full }) {
  /* The real dock trash has no tile behind it — just the metal basket. */
  return (
    <Tile>
      <defs>
        <linearGradient id="tr-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f4f4f6" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#d3d3d9" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ececed" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {/* lid */}
      <rect x="9" y="12.5" width="34" height="3.6" rx="1.8" fill="#e9e9ec" />
      <path
        d="M21 12V9.8c0-1 .8-1.8 1.8-1.8h6.4c1 0 1.8.8 1.8 1.8V12"
        stroke="#e9e9ec"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* basket */}
      <path d="M12.4 18h27.2l-2.5 22.4a3 3 0 0 1-3 2.6H17.9a3 3 0 0 1-3-2.6L12.4 18z" fill="url(#tr-b)" />
      <path
        d="M18.4 22.5 19.8 39M26 22.5V39M33.6 22.5 32.2 39"
        stroke="#a9a9b2"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={full ? "0.25" : "0.6"}
      />
      {full && <path d="M16 25h20l-1.6 14.6a3 3 0 0 1-3 2.6H20.6a3 3 0 0 1-3-2.6L16 25z" fill="#b9c3cf" />}
    </Tile>
  );
}

export function HelpIcon() {
  return (
    <Tile>
      <defs>
        <linearGradient id="hp-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe9f7" />
        </linearGradient>
        <linearGradient id="hp-q" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5aa9ff" />
          <stop offset="1" stopColor="#1c6fe0" />
        </linearGradient>
      </defs>
      <rect width="52" height="52" fill="url(#hp-b)" />
      <path
        d="M20 21.4c.3-3.2 2.7-5.3 6-5.3 3.5 0 6 2.2 6 5.2 0 2.4-1.4 3.8-3.4 5.1-1.9 1.2-2.6 2.2-2.6 4.1v1"
        stroke="url(#hp-q)"
        strokeWidth="3.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="26" cy="37.2" r="2.6" fill="url(#hp-q)" />
    </Tile>
  );
}
