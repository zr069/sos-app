export interface Contact {
  id: string;
  name: string;
  createdAt: string;
}

export interface GhostEvent {
  id: string;
  contactId: string;
  timestamp: string;
}

export interface Metrics {
  sigma: number;
  iota: number;
  tauHalf: number;
  entropy: number;
  weekdayCounts: number[];
  hourCounts: number[];
  peakWeekday: { day: string; percent: number };
  peakHour: { hour: number; percent: number };
  medianInterval: number;
  varianz: number;
  trendGradient: string;
  trendArrow: string;
  rezidivRisk: number;
  streakMax: number;
  pValue: number;
  pLabel: string;
  ci95: { lower: number; upper: number };
  weekendBias: number;
  nightCoefficient: number;
  gefaehrdung: string;
  gefaehrdungColor: string;
  eventCount: number;
  daysSinceFirst: number;
}
