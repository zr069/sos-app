import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Badge from './Badge';
import { Contact, GhostEvent } from '../types';
import { calcAllMetrics } from '../lib/metrics';

interface ContactCardProps {
  contact: Contact;
  events: GhostEvent[];
  onGhost: () => void;
}

export default function ContactCard({ contact, events, onGhost }: ContactCardProps) {
  const router = useRouter();
  const metrics = calcAllMetrics(events);

  const handleGhost = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onGhost();
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/contact/${contact.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{contact.name}</Text>
        {metrics && (
          <Badge label={metrics.gefaehrdung} color={metrics.gefaehrdungColor} />
        )}
      </View>

      <View style={styles.metricsRow}>
        <Text style={styles.metric}>
          Score: {metrics ? metrics.sigma.toFixed(2) : '–'}
        </Text>
        <Text style={styles.metric}>
          Index: {metrics ? `${metrics.iota.toFixed(1)}%` : '–'}
        </Text>
        <Text style={styles.metricCount}>{events.length} Events</Text>
      </View>

      <TouchableOpacity style={styles.ghostButton} onPress={handleGhost}>
        <Text style={styles.ghostButtonText}>Nicht abgehoben</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f4f4f5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    color: '#09090b',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  metric: {
    color: '#71717a',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  metricCount: {
    color: '#a1a1aa',
    fontSize: 12,
    marginLeft: 'auto',
  },
  ghostButton: {
    backgroundColor: '#e4e4e7',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: '#09090b',
    fontSize: 14,
    fontWeight: '600',
  },
});
