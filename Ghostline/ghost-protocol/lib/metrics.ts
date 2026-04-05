import { GhostEvent, Metrics } from '../types';

const WEEKDAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export function calcAllMetrics(events: GhostEvent[]): Metrics | null {
  const n = events.length;
  if (n === 0) return null;

  const now = Date.now();
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const firstEvent = new Date(sorted[0].timestamp).getTime();
  const lastEvent = new Date(sorted[n - 1].timestamp).getTime();
  const daysSinceFirst = Math.max(1, (now - firstEvent) / 86400000);

  // σ Ghosting-Koeffizient
  const sigma = Math.min(10, (n / daysSinceFirst) * Math.E);

  // ι Ignoranz-Index
  const recentEvents = events.filter(
    (e) => now - new Date(e.timestamp).getTime() < 604800000
  ).length;
  const iota = Math.min(100, recentEvents * 14.28);

  // τ½ Erreichbarkeits-Halbwertszeit
  const tauHalf = 7 / Math.log2(n + 1);

  // H Kommunikations-Entropie
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  const hourCounts = Array(24).fill(0) as number[];
  events.forEach((e) => {
    const d = new Date(e.timestamp);
    weekdayCounts[d.getDay()]++;
    hourCounts[d.getHours()]++;
  });
  const entropy = -weekdayCounts
    .map((c) => c / n)
    .filter((p) => p > 0)
    .reduce((sum, p) => sum + p * Math.log2(p), 0);

  // Peak-Wochentag
  const maxWeekday = Math.max(...weekdayCounts);
  const peakWeekdayIdx = weekdayCounts.indexOf(maxWeekday);
  const peakWeekday = {
    day: WEEKDAY_NAMES[peakWeekdayIdx],
    percent: Math.round((maxWeekday / n) * 100),
  };

  // Peak-Uhrzeit
  const maxHour = Math.max(...hourCounts);
  const peakHourIdx = hourCounts.indexOf(maxHour);
  const peakHour = {
    hour: peakHourIdx,
    percent: Math.round((maxHour / n) * 100),
  };

  // Intervalle
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(
      (new Date(sorted[i].timestamp).getTime() -
        new Date(sorted[i - 1].timestamp).getTime()) /
        86400000
    );
  }
  const sortedIntervals = [...intervals].sort((a, b) => a - b);
  const medianInterval =
    sortedIntervals.length > 0
      ? sortedIntervals[Math.floor(sortedIntervals.length / 2)]
      : 0;
  const avgInterval =
    intervals.length > 0
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length
      : 7;
  const varianz =
    intervals.length > 0
      ? Math.sqrt(
          intervals.reduce((sum, x) => sum + Math.pow(x - avgInterval, 2), 0) /
            intervals.length
        )
      : 0;

  // ∇ Trend-Gradient
  const halfN = Math.floor(n / 2);
  let trendGradient = '0.00';
  let trendArrow = '→';
  if (halfN > 0 && n > 2) {
    const firstHalfTs = sorted.slice(0, halfN);
    const secondHalfTs = sorted.slice(halfN);
    const firstSpan =
      (new Date(firstHalfTs[firstHalfTs.length - 1].timestamp).getTime() -
        new Date(firstHalfTs[0].timestamp).getTime()) /
        86400000 || 1;
    const secondSpan =
      (new Date(secondHalfTs[secondHalfTs.length - 1].timestamp).getTime() -
        new Date(secondHalfTs[0].timestamp).getTime()) /
        86400000 || 1;
    const firstRate = firstHalfTs.length / firstSpan;
    const secondRate = secondHalfTs.length / secondSpan;
    const gradient = secondRate - firstRate;
    trendGradient = gradient.toFixed(2);
    trendArrow = gradient > 0.1 ? '↗' : gradient < -0.1 ? '↘' : '→';
  }

  // ρ Rezidiv-Risiko
  const daysSinceLast = (now - lastEvent) / 86400000;
  const rezidivRisk = Math.min(
    100,
    Math.max(0, 100 - daysSinceLast * (100 / Math.max(avgInterval * 2, 1)))
  );

  // Streak-Maximum
  let streakMax = 1;
  let currentStreak = 1;
  const eventDays = new Set<string>();
  sorted.forEach((e) => {
    eventDays.add(new Date(e.timestamp).toISOString().slice(0, 10));
  });
  const dayList = [...eventDays].sort();
  for (let i = 1; i < dayList.length; i++) {
    const prev = new Date(dayList[i - 1]).getTime();
    const curr = new Date(dayList[i]).getTime();
    if (curr - prev === 86400000) {
      currentStreak++;
      streakMax = Math.max(streakMax, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  // p-Wert
  const pValue = 1 / (n + 1);
  let pLabel: string;
  if (pValue < 0.001) pLabel = 'p < 0.001 (hochsignifikant)';
  else if (pValue < 0.01) pLabel = `p = ${pValue.toFixed(3)} (sehr signifikant)`;
  else if (pValue < 0.05) pLabel = `p = ${pValue.toFixed(3)} (signifikant)`;
  else pLabel = `p = ${pValue.toFixed(3)} (nicht signifikant)`;

  // 95% Konfidenzintervall für Events/Woche
  const weeksTotal = Math.max(1, daysSinceFirst / 7);
  const eventsPerWeek = n / weeksTotal;
  const stdPerWeek = Math.sqrt(eventsPerWeek / weeksTotal);
  const ci95 = {
    lower: Math.max(0, eventsPerWeek - 1.96 * stdPerWeek),
    upper: eventsPerWeek + 1.96 * stdPerWeek,
  };

  // β Wochenend-Bias
  const weekendEvents = weekdayCounts[0] + weekdayCounts[6];
  const weekdayEvents = n - weekendEvents;
  const weekendBias =
    weekdayEvents > 0 ? (weekendEvents / weekdayEvents) * 2.5 : 0;

  // ν Nacht-Koeffizient (22:00-06:00)
  const nightEvents = hourCounts
    .filter((_, i) => i >= 22 || i < 6)
    .reduce((a, b) => a + b, 0);
  const nightCoefficient = n > 0 ? nightEvents / n : 0;

  // Gefährdungsgrad
  let gefaehrdung: string;
  let gefaehrdungColor: string;
  if (sigma < 1) {
    gefaehrdung = 'Stabil';
    gefaehrdungColor = '#22c55e';
  } else if (sigma < 3) {
    gefaehrdung = 'Gefährdet';
    gefaehrdungColor = '#eab308';
  } else if (sigma < 5) {
    gefaehrdung = 'Kritisch';
    gefaehrdungColor = '#f97316';
  } else if (sigma < 7) {
    gefaehrdung = 'Terminal';
    gefaehrdungColor = '#ef4444';
  } else {
    gefaehrdung = 'Klinisch tot';
    gefaehrdungColor = '#71717a';
  }

  return {
    sigma,
    iota,
    tauHalf,
    entropy,
    weekdayCounts,
    hourCounts,
    peakWeekday,
    peakHour,
    medianInterval,
    varianz,
    trendGradient,
    trendArrow,
    rezidivRisk,
    streakMax,
    pValue,
    pLabel,
    ci95,
    weekendBias,
    nightCoefficient,
    gefaehrdung,
    gefaehrdungColor,
    eventCount: n,
    daysSinceFirst,
  };
}
