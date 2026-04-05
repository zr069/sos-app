import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

interface MetricCardProps {
  symbol: string;
  label: string;
  value: string;
  color?: string;
  infoTitle?: string;
  infoText?: string;
}

export default function MetricCard({
  symbol,
  label,
  value,
  color,
  infoTitle,
  infoText,
}: MetricCardProps) {
  return (
    <View style={styles.card}>
      {infoTitle && infoText && (
        <TouchableOpacity
          style={styles.infoBtn}
          onPress={() => Alert.alert(infoTitle, infoText)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.infoText}>i</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.symbol}>{symbol}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f4f4f5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    flex: 1,
    minWidth: '45%',
    margin: 4,
  },
  infoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  infoText: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  symbol: {
    color: '#71717a',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  label: {
    color: '#a1a1aa',
    fontSize: 11,
    marginTop: 2,
  },
  value: {
    color: '#09090b',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 4,
  },
});
