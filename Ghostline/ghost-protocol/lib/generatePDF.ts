import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Contact, GhostEvent, Metrics } from '../types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getConclusion(m: Metrics, name: string): string {
  switch (m.gefaehrdung) {
    case 'Stabil':
      return `Die Kommunikationsvermeidungstendenz von ${name} liegt im Normalbereich. Weitere Beobachtung empfohlen.`;
    case 'Gefährdet':
      return `${name} zeigt erste Anzeichen systematischer Kommunikationsvermeidung. Eine Eskalation ist wahrscheinlich.`;
    case 'Kritisch':
      return `Die Erreichbarkeit von ${name} hat ein kritisches Niveau erreicht. Sofortige Intervention wird empfohlen.`;
    case 'Terminal':
      return `${name} befindet sich in einem terminalen Stadium der Kommunikationsverweigerung. Prognose: ungünstig.`;
    default:
      return `Für ${name} kann kein aktives Kommunikationsverhalten mehr nachgewiesen werden. Der Kontakt ist klinisch tot.`;
  }
}

export async function generateAndSharePDF(
  contact: Contact,
  events: GhostEvent[],
  metrics: Metrics
): Promise<void> {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const eventRows = sortedEvents
    .map(
      (e, i) =>
        `<tr><td style="padding:6px;border-bottom:1px solid #333;">${i + 1}</td><td style="padding:6px;border-bottom:1px solid #333;">${formatDate(e.timestamp)}</td></tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111; padding: 40px; font-size: 13px; line-height: 1.6; }
  h1 { text-align: center; font-size: 22px; margin-bottom: 4px; }
  .subtitle { text-align: center; color: #666; font-size: 12px; margin-bottom: 30px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 15px; font-weight: bold; border-bottom: 2px solid #111; padding-bottom: 4px; margin-bottom: 12px; }
  .abstract { background: #f5f5f5; padding: 16px; border-left: 4px solid #111; font-style: italic; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { text-align: left; padding: 8px 6px; border-bottom: 2px solid #111; font-size: 12px; }
  td { padding: 6px; border-bottom: 1px solid #ddd; font-size: 12px; }
  .metric-value { font-family: 'Courier New', monospace; font-weight: bold; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; color: white; font-weight: bold; font-size: 13px; }
  .footer { text-align: center; color: #999; font-size: 10px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 16px; }
  .conclusion { background: #f0f0f0; padding: 16px; border-radius: 8px; margin-top: 16px; }
</style>
</head>
<body>

<h1>GHOSTING RESEARCH INSTITUTE</h1>
<div class="subtitle">Peer-Reviewed Analysis &bull; Erstellt am ${new Date().toLocaleDateString('de-DE')}</div>
<div class="subtitle">Kontakt: <strong>${contact.name}</strong> &bull; Gef&auml;hrdungsgrad: <span class="badge" style="background:${metrics.gefaehrdungColor};">${metrics.gefaehrdung}</span></div>

<div class="abstract">
<strong>Abstract:</strong> Die vorliegende Analyse untersucht das Kommunikationsvermeidungsverhalten von ${contact.name} basierend auf ${metrics.eventCount} dokumentierten Ereignissen über einen Zeitraum von ${metrics.daysSinceFirst.toFixed(1)} Tagen. Die statistische Auswertung erfolgt mittels quantitativer Methoden der Kommunikationsforschung.
</div>

<div class="section">
<div class="section-title">I. Methodik</div>
<p>Zur Erfassung der Kommunikationsvermeidung wurde ein longitudinales Event-Tracking-Verfahren eingesetzt. Jedes Nicht-Abheben wurde mit präzisem Zeitstempel dokumentiert. Die statistische Analyse umfasst deskriptive Metriken, Entropieberechnung, Trendanalyse sowie prädiktive Modellierung.</p>
</div>

<div class="section">
<div class="section-title">II. Primäre Metriken</div>
<table>
<tr><th>Metrik</th><th>Symbol</th><th>Wert</th></tr>
<tr><td>Ghosting-Koeffizient</td><td class="metric-value">σ</td><td class="metric-value">${metrics.sigma.toFixed(2)}</td></tr>
<tr><td>Ignoranz-Index</td><td class="metric-value">ι</td><td class="metric-value">${metrics.iota.toFixed(1)}%</td></tr>
<tr><td>Erreichbarkeits-Halbwertszeit</td><td class="metric-value">τ½</td><td class="metric-value">${metrics.tauHalf.toFixed(2)} Tage</td></tr>
<tr><td>Kommunikations-Entropie</td><td class="metric-value">H</td><td class="metric-value">${metrics.entropy.toFixed(2)} bit</td></tr>
</table>
</div>

<div class="section">
<div class="section-title">III. Zeitliche Analyse</div>
<table>
<tr><th>Metrik</th><th>Wert</th></tr>
<tr><td>Peak-Wochentag</td><td class="metric-value">${metrics.peakWeekday.day} (${metrics.peakWeekday.percent}%)</td></tr>
<tr><td>Peak-Uhrzeit</td><td class="metric-value">${metrics.peakHour.hour}:00 Uhr (${metrics.peakHour.percent}%)</td></tr>
<tr><td>Median-Intervall (Δt̃)</td><td class="metric-value">${metrics.medianInterval.toFixed(2)} Tage</td></tr>
<tr><td>Standardabweichung (σ²)</td><td class="metric-value">${metrics.varianz.toFixed(2)} Tage</td></tr>
</table>
</div>

<div class="section">
<div class="section-title">IV. Statistische Analyse</div>
<table>
<tr><th>Metrik</th><th>Wert</th></tr>
<tr><td>Trend-Gradient (∇)</td><td class="metric-value">${metrics.trendGradient} ${metrics.trendArrow}</td></tr>
<tr><td>Rezidiv-Risiko (ρ)</td><td class="metric-value">${metrics.rezidivRisk.toFixed(1)}%</td></tr>
<tr><td>Streak-Maximum</td><td class="metric-value">${metrics.streakMax} Tage</td></tr>
<tr><td>Signifikanz</td><td class="metric-value">${metrics.pLabel}</td></tr>
<tr><td>KI₉₅ Events/Woche</td><td class="metric-value">[${metrics.ci95.lower.toFixed(2)}, ${metrics.ci95.upper.toFixed(2)}]</td></tr>
<tr><td>Wochenend-Bias (β)</td><td class="metric-value">${metrics.weekendBias.toFixed(2)}</td></tr>
<tr><td>Nacht-Koeffizient (ν)</td><td class="metric-value">${(metrics.nightCoefficient * 100).toFixed(1)}%</td></tr>
</table>
</div>

<div class="section">
<div class="section-title">V. Event-Protokoll (n=${metrics.eventCount})</div>
<table>
<tr><th>#</th><th>Zeitpunkt</th></tr>
${eventRows}
</table>
</div>

<div class="section">
<div class="section-title">VI. Schlussfolgerung</div>
<div class="conclusion">
${getConclusion(metrics, contact.name)}
</div>
</div>

<div class="footer">
Erstellt mit Ghosting Research Institute -- Deine Ausreden sind dokumentiert.<br>
&copy; ${new Date().getFullYear()} Ghosting Research Institute. Alle Rechte vorbehalten.
</div>

</body>
</html>
`;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Ghost Report: ${contact.name}`,
    UTI: 'com.adobe.pdf',
  });
}
