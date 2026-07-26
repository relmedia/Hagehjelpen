import { BASE_POINT } from "@/lib/geonorge";

type Zone = "kjerne" | "utvidet" | "utenfor";

type City = {
  name: string;
  lat: number;
  lon: number;
  dx: number;
  dy: number;
  anchor: "start" | "middle" | "end";
};

const VIEW_W = 440;
const VIEW_H = 400;

/** Kartet tegnes i kilometer rundt basen og skaleres til piksler, slik at
 *  dekningssirklene faktisk tilsvarer 15 og 22 km i luftlinje. */
const SCALE = 6.1;
const KM_PER_LAT = 111.13;
const KM_PER_LON = 57.5;
const ORIGIN = { x: 220, y: 195 };

const CORE_KM = 15;
const EXTENDED_KM = 22;

function project(lat: number, lon: number) {
  return {
    x: ORIGIN.x + (lon - BASE_POINT.lon) * KM_PER_LON * SCALE,
    y: ORIGIN.y - (lat - BASE_POINT.lat) * KM_PER_LAT * SCALE,
  };
}

const CITIES: City[] = [
  { name: "Randaberg", lat: 58.987, lon: 5.618, dx: 0, dy: -13, anchor: "middle" },
  { name: "Stavanger", lat: 58.97, lon: 5.733, dx: 11, dy: -2, anchor: "start" },
  { name: "Sola", lat: 58.888, lon: 5.647, dx: 3, dy: -12, anchor: "start" },
  { name: "Ræge", lat: BASE_POINT.lat, lon: BASE_POINT.lon, dx: 0, dy: 22, anchor: "middle" },
  { name: "Sandnes", lat: 58.851, lon: 5.739, dx: 11, dy: 4, anchor: "start" },
  { name: "Ålgård", lat: 58.78, lon: 5.85, dx: 11, dy: 4, anchor: "start" },
  { name: "Bryne", lat: 58.735, lon: 5.647, dx: -11, dy: 4, anchor: "end" },
];

const POINTS = Object.fromEntries(
  CITIES.map((city) => [city.name, project(city.lat, city.lon)]),
) as Record<string, { x: number; y: number }>;

const BASE = POINTS.Ræge;

/** Kystlinjen går utenfor viewBox slik at kartet kan beskjæres i alle
 *  formater uten at det oppstår tomme kanter. */
const SHORE = [
  "M 203 -40",
  "C 185 10, 177 50, 191 96",
  "C 205 140, 195 168, 203 196",
  "C 211 226, 191 252, 185 288",
  "C 179 326, 185 368, 171 404",
  "L 165 440",
].join(" ");

const LAND = `${SHORE} L 480 440 L 480 -40 Z`;

/** Gandsfjorden, som stikker inn fra nord og ender ved Sandnes. */
const FJORD =
  "M 307 -40 C 303 40, 297 130, 291 182 C 289 198, 288 208, 289 216 C 295 204, 301 186, 307 162 C 321 106, 337 34, 345 -40 Z";

const ISLANDS = [
  "M 103 34 C 123 26, 141 34, 137 48 C 133 62, 107 66, 95 56 C 87 48, 91 38, 103 34 Z",
  "M 71 128 C 87 122, 101 130, 97 142 C 93 154, 71 156, 63 146 C 57 138, 61 132, 71 128 Z",
  "M 119 258 C 131 254, 141 260, 138 269 C 135 278, 117 280, 111 273 C 106 267, 110 261, 119 258 Z",
];

function road(from: { x: number; y: number }, to: { x: number; y: number }, bend = 0) {
  const mx = (from.x + to.x) / 2 + bend * (to.y - from.y);
  const my = (from.y + to.y) / 2 - bend * (to.x - from.x);
  return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

const ROADS = [
  road(POINTS.Randaberg, POINTS.Stavanger, 0.08),
  road(POINTS.Stavanger, POINTS.Sandnes, -0.06),
  road(POINTS.Stavanger, POINTS.Sola, 0.1),
  road(POINTS.Sola, BASE, 0.06),
  road(POINTS.Sola, POINTS.Sandnes, 0.05),
  road(POINTS.Sandnes, POINTS.Ålgård, 0.07),
  road(POINTS.Sandnes, POINTS.Bryne, -0.05),
  road(BASE, POINTS.Bryne, 0.08),
];

type CoverageMapProps = {
  activeZone?: Zone | null;
  activeName?: string;
};

export function CoverageMap({ activeZone, activeName }: CoverageMapProps) {
  const coreActive = activeZone === "kjerne";
  const extendedActive = activeZone === "utvidet";

  return (
    <div className="absolute inset-0">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="img"
        aria-label="Kart over Hagehjelpen sitt dekningsområde på Nord-Jæren"
      >
        <defs>
          <linearGradient id="coverage-sea" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#dceaf6" />
            <stop offset="100%" stopColor="#b6d3e9" />
          </linearGradient>
          <linearGradient id="coverage-land" x1="0.2" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#f6faee" />
            <stop offset="100%" stopColor="#dcecc6" />
          </linearGradient>
          <radialGradient id="coverage-core" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#65b427" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#65b427" stopOpacity="0.12" />
          </radialGradient>
          <clipPath id="coverage-land-clip">
            <path d={LAND} />
          </clipPath>
          <filter id="coverage-pin" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1.4"
              floodColor="#0f172a"
              floodOpacity="0.28"
            />
          </filter>
        </defs>

        <rect width={VIEW_W} height={VIEW_H} fill="url(#coverage-sea)" />

        <path d={LAND} fill="url(#coverage-land)" />
        {ISLANDS.map((island) => (
          <path
            key={island}
            d={island}
            fill="url(#coverage-land)"
            stroke="#8fbcda"
            strokeWidth="1.2"
          />
        ))}
        <path
          d={FJORD}
          fill="url(#coverage-sea)"
          stroke="#8fbcda"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d={SHORE}
          fill="none"
          stroke="#8fbcda"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        <g clipPath="url(#coverage-land-clip)">
          <circle
            cx={BASE.x}
            cy={BASE.y}
            r={EXTENDED_KM * SCALE}
            fill="#f59e0b"
            fillOpacity={extendedActive ? 0.16 : 0.08}
          />
          <circle
            cx={BASE.x}
            cy={BASE.y}
            r={CORE_KM * SCALE}
            fill="url(#coverage-core)"
            fillOpacity={coreActive ? 1 : 0.75}
          />
        </g>

        <g>
          {ROADS.map((path) => (
            <path
              key={`${path}-casing`}
              d={path}
              fill="none"
              stroke="#c3d2b3"
              strokeWidth="3.4"
              strokeOpacity="0.7"
              strokeLinecap="round"
            />
          ))}
          {ROADS.map((path) => (
            <path
              key={path}
              d={path}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </g>

        <circle
          cx={BASE.x}
          cy={BASE.y}
          r={EXTENDED_KM * SCALE}
          fill="none"
          stroke="#d97706"
          strokeWidth={extendedActive ? 2 : 1.4}
          strokeDasharray="6 6"
          strokeOpacity={extendedActive ? 0.95 : 0.6}
        />
        <circle
          cx={BASE.x}
          cy={BASE.y}
          r={CORE_KM * SCALE}
          fill="none"
          stroke="#4c901c"
          strokeWidth={coreActive ? 2.4 : 1.6}
          strokeOpacity={coreActive ? 1 : 0.75}
        />

        {CITIES.map((city) => {
          const point = POINTS[city.name];
          const isBase = city.name === "Ræge";
          const isActive =
            !!activeName &&
            activeName.toLowerCase().includes(city.name.toLowerCase());

          return (
            <g key={city.name}>
              {isBase ? (
                <g filter="url(#coverage-pin)">
                  <path
                    d={`M ${point.x} ${point.y} c -7.5 -9 -11 -13.5 -11 -19 a 11 11 0 1 1 22 0 c 0 5.5 -3.5 10 -11 19 z`}
                    fill="#2f6b12"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <circle cx={point.x} cy={point.y - 19} r="4" fill="#ffffff" />
                </g>
              ) : (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isActive ? 6 : 4.6}
                  fill={isActive ? "#65b427" : "#ffffff"}
                  stroke={isActive ? "#2f6b12" : "#6f8a5a"}
                  strokeWidth="2"
                  filter="url(#coverage-pin)"
                />
              )}

              <text
                x={point.x + city.dx}
                y={point.y + city.dy}
                textAnchor={city.anchor}
                fontSize={isBase ? 13 : 12}
                fontWeight={isBase || isActive ? 700 : 600}
                fill={isBase ? "#2f6b12" : "#1f3313"}
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {city.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 px-4 pb-3.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm ${
            coreActive
              ? "border-leaf-400 bg-leaf-50 text-leaf-800"
              : "border-leaf-100 bg-white/85 text-ink-soft"
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full border border-leaf-600 bg-leaf-500/30" />
          Kjerne · 15 km
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm ${
            extendedActive
              ? "border-amber-400 bg-amber-50 text-amber-900"
              : "border-leaf-100 bg-white/85 text-ink-soft"
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full border border-dashed border-amber-500 bg-amber-400/20" />
          Utvidet · kjøretillegg
        </span>
      </div>
    </div>
  );
}
