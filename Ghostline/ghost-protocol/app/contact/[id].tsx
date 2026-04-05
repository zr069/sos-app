import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Badge from '../../components/Badge';
import MetricCard from '../../components/MetricCard';
import WeekdayChart from '../../components/WeekdayChart';
import EventItem from '../../components/EventItem';
import { Contact, GhostEvent } from '../../types';
import {
  getContacts,
  getEventsForContact,
  addEvent,
  deleteEvent,
  deleteContact,
} from '../../lib/storage';
import { calcAllMetrics } from '../../lib/metrics';
import { generateAndSharePDF } from '../../lib/generatePDF';
import { trackGhostAndMaybeShowAd } from '../../lib/ads';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [events, setEvents] = useState<GhostEvent[]>([]);

  const loadData = useCallback(async () => {
    if (!id) return;
    const contacts = await getContacts();
    const c = contacts.find((c) => c.id === id) ?? null;
    setContact(c);
    const e = await getEventsForContact(id);
    setEvents(e.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const metrics = calcAllMetrics(events);

  const handleGhost = async () => {
    if (!id) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await addEvent(id);
    await trackGhostAndMaybeShowAd();
    await loadData();
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    await loadData();
  };

  const handleDeleteContact = () => {
    if (!contact) return;
    Alert.alert(
      'Kontakt löschen',
      `"${contact.name}" und alle Events unwiderruflich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await deleteContact(contact.id);
            router.back();
          },
        },
      ]
    );
  };

  const handlePDF = async () => {
    if (!contact || !metrics) return;
    await generateAndSharePDF(contact, events, metrics);
  };

  if (!contact) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Lade...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Zurück</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{contact.name}</Text>
          {metrics && (
            <Badge label={metrics.gefaehrdung} color={metrics.gefaehrdungColor} />
          )}
        </View>

        {/* Ghost Button */}
        <TouchableOpacity style={styles.ghostButton} onPress={handleGhost}>
          <Text style={styles.ghostButtonText}>Nicht abgehoben</Text>
        </TouchableOpacity>

        {!metrics ? (
          <Text style={styles.emptyText}>
            Noch keine Events. Drücke "Nicht abgehoben" wenn {contact.name} nicht
            rangeht.
          </Text>
        ) : (
          <>
            {/* Primare Metriken */}
            <Text style={styles.sectionTitle}>Primäre Metriken</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                symbol="Score"
                label="Ghosting-Koeffizient"
                value={metrics.sigma.toFixed(2)}
                color={metrics.gefaehrdungColor}
                infoTitle="Was ist der Ghosting-Score?"
                infoText="Je höher die Zahl, desto öfter ignoriert dich diese Person. 0-2 ist normal, ab 5 wird's kritisch."
              />
              <MetricCard
                symbol="Index"
                label="Ignoranz-Index"
                value={`${metrics.iota.toFixed(1)}%`}
                infoTitle="Was ist der Ignoranz-Index?"
                infoText="Zeigt wie oft du in den letzten 7 Tagen ignoriert wurdest. 100% heißt: Du wirst ständig ignoriert."
              />
              <MetricCard
                symbol="HWZ"
                label="Halbwertszeit"
                value={`${metrics.tauHalf.toFixed(2)} d`}
                infoTitle="Was ist die Halbwertszeit?"
                infoText="So viele Tage dauert es im Schnitt, bis diese Person dich wieder ignoriert."
              />
              <MetricCard
                symbol="Ent."
                label="Entropie"
                value={`${metrics.entropy.toFixed(2)} bit`}
                infoTitle="Was ist die Entropie?"
                infoText="Zeigt ob die Person an bestimmten Tagen ignoriert (niedrig) oder komplett zufällig (hoch). Hohe Entropie = unberechenbar."
              />
            </View>

            {/* Zeitliche Analyse */}
            <Text style={styles.sectionTitle}>Zeitliche Analyse</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                symbol="Tag"
                label="Peak-Wochentag"
                value={`${metrics.peakWeekday.day} (${metrics.peakWeekday.percent}%)`}
                infoTitle="Was bedeutet Peak-Wochentag?"
                infoText="An diesem Wochentag wirst du am häufigsten ignoriert."
              />
              <MetricCard
                symbol="Zeit"
                label="Peak-Uhrzeit"
                value={`${metrics.peakHour.hour}:00 (${metrics.peakHour.percent}%)`}
                infoTitle="Was bedeutet Peak-Uhrzeit?"
                infoText="Um diese Uhrzeit wirst du am häufigsten ignoriert."
              />
              <MetricCard
                symbol="Med."
                label="Median-Intervall"
                value={`${metrics.medianInterval.toFixed(2)} d`}
                infoTitle="Was ist das Median-Intervall?"
                infoText="So viele Tage vergehen normalerweise zwischen zwei Ignorier-Vorfällen."
              />
              <MetricCard
                symbol="Abw."
                label="Standardabweichung"
                value={`${metrics.varianz.toFixed(2)} d`}
                infoTitle="Was ist die Standardabweichung?"
                infoText="Zeigt wie regelmäßig du ignoriert wirst. Niedrig = regelmäßig, Hoch = mal viel, mal wenig."
              />
            </View>

            {/* Trend-Analyse */}
            <Text style={styles.sectionTitle}>Trend-Analyse</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                symbol="Trend"
                label="Trend-Gradient"
                value={`${metrics.trendGradient} ${metrics.trendArrow}`}
                infoTitle="Was bedeutet der Trend?"
                infoText={'Pfeil nach oben \u2197 = es wird schlimmer. Pfeil nach unten \u2198 = es bessert sich.'}
              />
              <MetricCard
                symbol="Risiko"
                label="Rezidiv-Risiko (48h)"
                value={`${metrics.rezidivRisk.toFixed(1)}%`}
                infoTitle="Was ist das Rezidiv-Risiko?"
                infoText="Die Wahrscheinlichkeit, dass du in den nächsten 48 Stunden wieder ignoriert wirst."
              />
              <MetricCard
                symbol="Streak"
                label="Streak-Maximum"
                value={`${metrics.streakMax} d`}
                infoTitle="Was ist der Streak?"
                infoText="So viele Tage hintereinander wurdest du ignoriert – dein 'Rekord'."
              />
              <MetricCard
                symbol="Sig."
                label="Signifikanz"
                value={metrics.pLabel}
                infoTitle="Was bedeutet Signifikanz?"
                infoText="Je kleiner die Zahl, desto sicherer können wir sagen: Diese Person ignoriert dich absichtlich, nicht zufällig. Unter 0.05 = statistisch bewiesen."
              />
            </View>

            <View style={styles.metricsGrid}>
              <MetricCard
                symbol="KI 95%"
                label="Events/Woche"
                value={`[${metrics.ci95.lower.toFixed(1)}, ${metrics.ci95.upper.toFixed(1)}]`}
                infoTitle="Was ist das Konfidenzintervall?"
                infoText="Mit 95% Sicherheit wirst du pro Woche zwischen diesen beiden Werten ignoriert."
              />
              <MetricCard
                symbol="WE"
                label="Wochenend-Bias"
                value={metrics.weekendBias.toFixed(2)}
                infoTitle="Was ist der Wochenend-Bias?"
                infoText="Über 1.0 = du wirst am Wochenende öfter ignoriert. Unter 1.0 = unter der Woche öfter."
              />
              <MetricCard
                symbol="Nacht"
                label="Nacht-Koeffizient"
                value={`${(metrics.nightCoefficient * 100).toFixed(1)}%`}
                infoTitle="Was ist der Nacht-Koeffizient?"
                infoText="Wie viel Prozent der Ignorier-Vorfälle passieren nachts (22-6 Uhr)."
              />
              <MetricCard
                symbol="Total"
                label="Gesamt-Events"
                value={`${metrics.eventCount}`}
                infoTitle="Was sind Gesamt-Events?"
                infoText="Die Gesamtanzahl aller dokumentierten Ignorier-Vorfälle für diesen Kontakt."
              />
            </View>

            {/* Chart */}
            <WeekdayChart weekdayCounts={metrics.weekdayCounts} />

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.pdfButton} onPress={handlePDF}>
                <Text style={styles.pdfButtonText}>PDF teilen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteContact}
              >
                <Text style={styles.deleteButtonText}>Löschen</Text>
              </TouchableOpacity>
            </View>

            {/* Event-Protokoll */}
            <Text style={styles.sectionTitle}>
              Event-Protokoll (n={events.length})
            </Text>
            <View style={styles.eventList}>
              {events.map((event, index) => (
                <EventItem
                  key={event.id}
                  event={event}
                  index={index}
                  onDelete={handleDeleteEvent}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scroll: {
    padding: 16,
    paddingBottom: 60,
  },
  loading: {
    color: '#a1a1aa',
    textAlign: 'center',
    marginTop: 40,
  },
  backBtn: {
    marginBottom: 12,
  },
  backText: {
    color: '#71717a',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    color: '#09090b',
    fontSize: 26,
    fontWeight: '800',
    flex: 1,
    marginRight: 12,
  },
  ghostButton: {
    backgroundColor: '#e4e4e7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#d4d4d8',
  },
  ghostButtonText: {
    color: '#09090b',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: '#a1a1aa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 22,
  },
  sectionTitle: {
    color: '#71717a',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  pdfButton: {
    flex: 1,
    backgroundColor: '#09090b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#fafafa',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
  eventList: {
    backgroundColor: '#f4f4f5',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
});
