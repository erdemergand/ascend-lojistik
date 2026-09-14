import { cn } from "@/lib/utils";

export type MapRegion = {
  id: string;
  name: string;
  x: number;
  y: number;
};

export const mapRegions: MapRegion[] = [
  { id: "europe", name: "Avrupa", x: 515, y: 225 },
  { id: "namerica", name: "Kuzey Amerika", x: 230, y: 230 },
  { id: "samerica", name: "Güney Amerika", x: 330, y: 405 },
  { id: "fareast", name: "Uzak Doğu", x: 790, y: 245 },
  { id: "mideast", name: "Orta Doğu", x: 585, y: 275 },
  { id: "africa", name: "Afrika", x: 515, y: 355 },
];

const routes: Array<[string, string]> = [
  ["europe", "namerica"],
  ["europe", "fareast"],
  ["europe", "africa"],
  ["mideast", "fareast"],
  ["mideast", "samerica"],
  ["namerica", "samerica"],
];

function point(id: string) {
  const region = mapRegions.find((r) => r.id === id);
  if (!region) return mapRegions[0];
  return region;
}

function arc(a: MapRegion, b: MapRegion) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - Math.abs(a.x - b.x) * 0.28 - 20;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

/** Geographic world silhouette with animated trade routes. Decorative, not geographic data. */
export function WorldMap({
  className,
  activeRegion,
  onRegionHover,
}: {
  className?: string;
  activeRegion?: string | null;
  onRegionHover?: (id: string | null) => void;
}) {
  return (
    <svg
      viewBox="0 0 1000 560"
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label="Ascend Lojistik global operasyon ağı haritası"
    >
      <defs>
        <pattern id="ascend-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="currentColor" className="text-navy-foreground/15" />
        </pattern>
        <linearGradient id="ascend-route" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" className="text-navy-foreground/15" />
          <stop offset="50%" stopColor="currentColor" className="text-navy-foreground/80" />
          <stop offset="100%" stopColor="currentColor" className="text-navy-foreground/15" />
        </linearGradient>
      </defs>

      <image
        href="/brand/world-map.svg"
        x="45"
        y="-18"
        width="910"
        height="600"
        preserveAspectRatio="xMidYMid meet"
        className="opacity-20 invert"
      />

      {routes.map(([from, to], i) => {
        const a = point(from);
        const b = point(to);
        if (!a || !b) return null;
        const active = activeRegion === from || activeRegion === to;
        return (
          <path
            key={`${from}-${to}`}
            d={arc(a, b)}
            fill="none"
            stroke="url(#ascend-route)"
            strokeWidth={active ? 2.4 : 1.4}
            strokeLinecap="round"
            strokeDasharray="6 10"
            className="transition-all duration-500"
            style={{
              opacity: activeRegion ? (active ? 1 : 0.25) : 0.75,
              animation: `ascend-dash ${8 + i}s linear infinite`,
              strokeDashoffset: 200,
            }}
          />
        );
      })}

      {mapRegions.map((r, i) => {
        const active = activeRegion === r.id;
        return (
          <g
            key={r.id}
            role="button"
            tabIndex={0}
            aria-label={`${r.name} bölgesini vurgula`}
            onMouseEnter={() => onRegionHover?.(r.id)}
            onMouseLeave={() => onRegionHover?.(null)}
            onFocus={() => onRegionHover?.(r.id)}
            onBlur={() => onRegionHover?.(null)}
            onClick={() => onRegionHover?.(active ? null : r.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onRegionHover?.(active ? null : r.id);
              }
            }}
            className="cursor-pointer outline-none focus-visible:[filter:drop-shadow(0_0_8px_currentColor)]"
          >
            <circle
              cx={r.x}
              cy={r.y}
              r={active ? 16 : 12}
              fill="currentColor"
              className="text-navy-foreground/25 transition-all duration-300"
              style={{ animation: `ascend-pulse-dot ${3 + i * 0.4}s ease-in-out infinite` }}
            />
            <circle
              cx={r.x}
              cy={r.y}
              r="4.5"
              fill="currentColor"
              className="text-navy-foreground"
            />
            <text
              x={r.x}
              y={r.y - 22}
              textAnchor="middle"
              className={cn(
                "font-display text-[13px] font-semibold transition-colors",
                active
                  ? "fill-current text-navy-foreground"
                  : "fill-current text-navy-foreground/90",
              )}
              fill="currentColor"
            >
              {r.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
