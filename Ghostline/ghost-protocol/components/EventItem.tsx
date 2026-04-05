import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GhostEvent } from '../types';

interface EventItemProps {
  event: GhostEvent;
  index: number;
  onDelete: (id: string) => void;
}

export default function EventItem({ event, index, onDelete }: EventItemProps) {
  const d = new Date(event.timestamp);
  const date = d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const weekday = d.toLocaleDateString('de-DE', { weekday: 'short' });

  return (
    <View style={styles.item}>
      <View style={styles.left}>
        <Text style={styles.index}>#{index + 1}</Text>
        <View>
          <Text style={styles.date}>
            {weekday}, {date}
          </Text>
          <Text style={styles.time}>{time} Uhr</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => onDelete(event.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>x</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  index: {
    color: '#a1a1aa',
    fontSize: 12,
    fontFamily: 'monospace',
    width: 30,
  },
  date: {
    color: '#09090b',
    fontSize: 14,
  },
  time: {
    color: '#71717a',
    fontSize: 12,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
