import { useMemo, useState } from 'react';
import type { WeekReview } from '../types';
import { formatShort } from '../lib/date';
import { cx } from './ui';

/**
 * Verlauf der Wochenbewertungen auf einer Skala von 1 bis 10.
 *
 * Eine Serie, eine Achse, ruhig gehalten: kein Raster außer der Mittellinie,
 * nur der letzte Punkt trägt seinen Wert. Kein Ziel, keine Bestmarke —
 * die Linie zeigt einen Verlauf, sie bewertet ihn nicht.
 */
export function WeekTrend({ reviews }: { reviews: WeekReview[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const points = useMemo(
    () =>
      reviews
        .filter((r) => typeof r.score === 'number')
        .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
        .map((r) => ({ week: r.weekStart, score: r.score as number })),
    [reviews],
  );

  if (points.length === 0) {
    return (
      <p className="text-[0.88rem] leading-relaxed text-ink-300 dark:text-paper-200/45">
        Sobald du eine Woche abschließt, entsteht hier ein Verlauf.
      </p>
    );
  }

  // Zeichenfläche: Rand oben/unten für Marker, links für die Achsenwerte.
  const W = 720;
  const H = 180;
  const padL = 26;
  const padR = 34;
  const padY = 18;
  const plotW = W - padL - padR;
  const plotH = H - padY * 2;

  const x = (i: number) =>
    points.length === 1 ? padL + plotW / 2 : padL + (i / (points.length - 1)) * plotW;
  // Skala 1–10, unten 1, oben 10.
  const y = (v: number) => padY + (1 - (v - 1) / 9) * plotH;

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.score)}`).join(' ');
  const last = points[points.length - 1];
  const active = hover !== null ? points[hover] : null;

  return (
    <figure className="m-0">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full min-w-[320px] text-ink-300 dark:text-paper-200/45"
          role="img"
          aria-label={`Verlauf der Wochenbewertungen, ${points.length} Wochen, zuletzt ${last.score} von 10`}
        >
          {/* Mittellinie als einzige Orientierung */}
          <line
            x1={padL}
            x2={W - padR}
            y1={y(5.5)}
            y2={y(5.5)}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.25"
          />
          <text x={4} y={y(10) + 4} fontSize="11" fill="currentColor" opacity="0.7">
            10
          </text>
          <text x={4} y={y(1) + 4} fontSize="11" fill="currentColor" opacity="0.7">
            1
          </text>

          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-forest-500 dark:text-forest-300"
          />

          {points.map((p, i) => (
            <g key={p.week}>
              {/* Großzügige Trefferfläche für den Zeiger */}
              <rect
                x={x(i) - 16}
                y={0}
                width={32}
                height={H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              <circle
                cx={x(i)}
                cy={y(p.score)}
                r={hover === i ? 6 : 4.5}
                className="text-forest-500 dark:text-forest-300"
                fill="currentColor"
                stroke="var(--chart-surface, #fbf9f4)"
                strokeWidth="2"
              />
            </g>
          ))}

          {/* Nur der letzte Wert trägt eine Beschriftung */}
          <text
            x={x(points.length - 1) + 10}
            y={y(last.score) + 4}
            fontSize="12"
            fill="currentColor"
            className="text-ink-500 dark:text-paper-200/70"
          >
            {last.score}
          </text>
        </svg>
      </div>

      <figcaption
        className={cx(
          'mt-2 text-[0.8rem] transition-colors duration-200',
          active ? 'text-ink-500 dark:text-paper-200/75' : 'text-ink-300 dark:text-paper-200/45',
        )}
      >
        {active
          ? `Woche ab ${formatShort(active.week)}: ${active.score} von 10`
          : `${points.length} ${points.length === 1 ? 'abgeschlossene Woche' : 'abgeschlossene Wochen'} · zuletzt ${last.score} von 10`}
      </figcaption>
    </figure>
  );
}
