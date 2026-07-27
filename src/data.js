
// Content pulled from the Framer project (home page work icons + dock)

/* Files live in /public with spaces and parentheses in their names, so every
   path is percent-encoded once, here, rather than at every call site. */
const enc = (p) => p.split("/").map(encodeURIComponent).join("/");
const T = (t) => enc(`/thai/WhatsApp Image 2026-07-27 at ${t}.jpeg`);
const B = (t) => enc(`/mount brumo/WhatsApp Image 2026-07-27 at ${t}.jpeg`);

/* Desktop folders. `photos[]` is what the album window shows; `videos[]` is
   only set on the Reel folder. Everything else on the desktop reads from here. */
export const albums = [
  {
    slug: "temples-of-gold",
    title: "Temples of Gold",
    year: "2026",
    category: "Architecture",
    place: "Bangkok & Pattaya",
    pos: { left: "16%", top: "30%" },
    tint: "linear-gradient(135deg,#d8a53c,#4a2f10)",
    excerpt:
      "Wat Pho, Wat Arun and the Big Buddha — gilt spires cut against a sky with nothing else in it. Shot low, mostly at noon, when the gold has no shadow to hide behind.",
    photos: [
      { src: T("7.50.03 PM"), caption: "The climb to the Big Buddha" },
      { src: T("8.02.00 PM (1)"), caption: "Gable, Wat Pho" },
      { src: T("7.45.16 PM"), caption: "Roof finials and the midday sun" },
      { src: T("8.01.59 PM"), caption: "The forest of chedis" },
      { src: T("8.02.00 PM"), caption: "Empty courtyard, Wat Pho" },
      { src: T("7.45.15 PM"), caption: "Wat Arun at the end of the alley" },
      { src: T("7.56.07 PM"), caption: "The Sanctuary of Truth from the trees" },
      { src: T("8.01.48 PM"), caption: "Teak dancers on the eaves" },
      { src: T("8.01.49 PM (1)"), caption: "Spire and cumulus" },
      { src: T("7.55.58 PM"), caption: "A pagoda facing the Gulf" },
      { src: T("7.56.04 PM"), caption: "A carved face going back to the forest" },
      { src: T("8.01.50 PM (1)"), caption: "Two heads, one bench" },
    ],
  },
  {
    slug: "yaowarat",
    title: "Yaowarat",
    year: "2026",
    category: "Street",
    place: "Bangkok Chinatown",
    pos: { left: "16%", top: "62%" },
    tint: "linear-gradient(135deg,#e0322f,#2a0708)",
    excerpt:
      "One road, after dark. Lanterns strung eight deep, tuk-tuks lit from underneath, and a grill working out of the back of a pickup truck.",
    photos: [
      { src: T("8.01.52 PM"), caption: "Yaowarat Road, all of it at once" },
      { src: T("8.01.58 PM"), caption: "Shark's fin and bird's nest" },
      { src: T("7.56.13 PM"), caption: "Taxi 1275" },
      { src: T("8.01.57 PM"), caption: "Under the lanterns" },
      { src: T("8.01.56 PM"), caption: "Crossing, four seconds of it" },
      { src: T("8.01.56 PM (1)"), caption: "A dragon over the door" },
      { src: T("8.01.57 PM (1)"), caption: "7-Eleven, Chaloem Buri" },
      { src: T("7.56.10 PM"), caption: "The grill, still warming up" },
      { src: T("7.56.14 PM"), caption: "Bicycle through the red" },
      { src: T("8.01.51 PM (1)"), caption: "The corner that never closes" },
      { src: T("8.01.58 PM (1)"), caption: "Standing on Yaowarat Road" },
      { src: T("7.45.13 PM"), caption: "Shophouses, before the heat" },
    ],
  },
  {
    slug: "salt-air",
    title: "Salt Air",
    year: "2026",
    category: "Coastal",
    place: "Pattaya, Gulf of Thailand",
    pos: { left: "34%", top: "44%" },
    tint: "linear-gradient(135deg,#4fa6b8,#123640)",
    excerpt:
      "Pattaya with the volume down. Towers standing in haze, a horse waiting out the afternoon, and a thunderhead building somewhere out over the water.",
    photos: [
      { src: T("8.01.49 PM"), caption: "Carriage, and the anvil behind it" },
      { src: T("8.01.46 PM"), caption: "Towers into the haze" },
      { src: T("8.01.49 PM (2)"), caption: "The pavilion on the water" },
      { src: T("8.01.47 PM"), caption: "Waiting out the afternoon" },
      { src: T("7.55.57 PM"), caption: "Terminal 21, and the plane that never leaves" },
      { src: T("8.01.51 PM"), caption: "Second Road, midday" },
      { src: T("7.45.11 PM"), caption: "Cake Land, North Pattaya" },
      { src: T("8.01.50 PM"), caption: "A soi with nothing happening" },
    ],
  },
  {
    slug: "sea-of-sand",
    title: "Sea of Sand",
    year: "2026",
    category: "Landscape",
    place: "Mount Bromo, East Java",
    pos: { left: "52%", top: "28%" },
    tint: "linear-gradient(135deg,#8b8f96,#1b1c1f)",
    excerpt:
      "The caldera floor at Bromo — black volcanic sand flat to the horizon, crossed on a borrowed horse. By afternoon the cloud comes over the rim and takes the whole thing.",
    photos: [
      { src: B("8.02.01 PM"), caption: "The caldera, and Semeru behind it" },
      { src: B("7.45.26 PM"), caption: "Across the sand, first person" },
      { src: B("8.02.04 PM"), caption: "253 steps to the rim" },
      { src: B("8.02.02 PM"), caption: "Land Cruisers waiting out the crowd" },
      { src: B("8.02.03 PM"), caption: "Saddled, facing the wrong way" },
      { src: B("8.02.05 PM (1)"), caption: "The white one" },
      { src: B("8.02.03 PM (1)"), caption: "A horse on the skyline" },
      { src: B("8.02.06 PM"), caption: "Weather coming over the rim" },
      { src: B("8.02.06 PM (1)"), caption: "Old lava, older jeep" },
      { src: B("8.02.05 PM"), caption: "The savanna, under cloud" },
      { src: B("8.02.04 PM (1)"), caption: "The green side of a volcano" },
      { src: B("8.02.02 PM (1)"), caption: "Above the cloud line, Cemoro Lawang" },
      { src: B("7.50.02 PM"), caption: "On the way in" },
    ],
  },
  {
    slug: "reel",
    title: "Reel",
    year: "2026",
    category: "Video",
    place: "Motion",
    pos: { left: "52%", top: "62%" },
    tint: "linear-gradient(135deg,#5b5f6a,#15161a)",
    excerpt: "Everything that moves. Cut from the same trips.",
    poster: "/123.png",
    videos: [
      {
        src: enc("/Final Reel.mp4"),
        poster: "/123.png",
        title: "Final Reel",
        meta: "Thailand · East Java",
      },
    ],
    photos: [],
  },
];

/* `color` is only used for the Spotlight swatch — the dock icons paint
   their own brand artwork. */
export const socials = [
  {
    label: "Instagram",
    url: "https://www.instagram.com/",
    color: "linear-gradient(45deg,#ffd521,#f50000,#b900b4,#5b6def)",
  },
  { label: "X", url: "https://www.x.com/", color: "#000000" },
  { label: "Behance", url: "https://www.behance.net/", color: "#1769ff" },
];

export const about = {
  name: "Zeeshan Moazzam",
  role: "Photographer · Visual Artist",
  portrait: "/portrait.png",
  bio: "I make quiet images about landscape, light and memory. Working between film and digital, I chase the moments most people walk past — the edges, the silences, the water where it sleeps.",
  based: "Based in New Delhi, India",
  email: "zeeshanmoazzam22@gmail.com",
  // Used by the Weather widget. Change these to match where you live.
  coords: { lat: 28.6139, lon: 77.209, city: "New Delhi" },
};

export const notes = [
  {
    title: "On slowness",
    meta: "Jul 2024",
    text: "The best frames arrive when I stop looking for them. Patience is the real lens.",
  },
  {
    title: "Field kit",
    meta: "May 2024",
    text: "One body, one 35mm, one roll of Portra. Constraints make me see more.",
  },
  {
    title: "Currently reading",
    meta: "Apr 2024",
    text: "On Photography — Sontag. Still the sharpest mirror for anyone holding a camera.",
  },
];

// Calendar widget entries. `day` is a day of the current month, so the
// calendar always looks alive without hard-coding a dead date.
export const events = [
  { day: 4, title: "Darkroom session", time: "10:00–13:00", color: "#fd5d5c" },
  { day: 12, title: "Studio portraits", time: "14:00–17:30", color: "#0066dd" },
  { day: 18, title: "Gallery walkthrough", time: "18:00–20:00", color: "#34c75a" },
  { day: 22, title: "Print review", time: "13:30–14:15", color: "#fac900" },
  { day: 27, title: "Coastal shoot", time: "05:30–09:00", color: "#af52de" },
];

// Seed notifications for the Notification Center. `target` is a window id.
export const seedNotifications = [
  {
    id: "n-photos",
    app: "Photos",
    appColor: "linear-gradient(135deg,#ffd86b,#ff5f6d)",
    title: "New album added",
    body: "Sea of Sand — 13 frames from Mount Bromo are now in the gallery",
    ago: "6m ago",
    target: "gallery",
  },
  {
    id: "n-mail",
    app: "Mail",
    appColor: "linear-gradient(135deg,#5eb0ff,#0066dd)",
    title: "Print enquiry",
    body: "Someone asked about a large-format print from Yaowarat",
    ago: "24m ago",
    target: "contact",
  },
  {
    id: "n-notes",
    app: "Notes",
    appColor: "linear-gradient(135deg,#ffe390,#f5c400)",
    title: "On slowness",
    body: "Patience is the real lens — draft saved",
    ago: "1h ago",
    target: "notes",
  },
];
