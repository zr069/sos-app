import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface WeekdayChartProps {
  weekdayCounts: number[];
}

const LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export default function WeekdayChart({ weekdayCounts }: WeekdayChartProps) {
  const screenWidth = Dimensions.get('window').width - 48;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events pro Wochentag</Text>
      <BarChart
        data={{
          labels: LABELS,
          datasets: [{ data: weekdayCounts }],
        }}
        width={screenWidth}
        height={200}
        yAxisLabel=""
        yAxisSuffix=""
        fromZero
        chartConfig={{
          backgroundColor: '#f4f4f5',
          backgroundGradientFrom: '#f4f4f5',
          backgroundGradientTo: '#f4f4f5',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(9, 9, 11, ${opacity})`,
          labelColor: () => '#71717a',
          barPercentage: 0.6,
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: '#e4e4e7',
          },
        }}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f4f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: 16,
  },
  title: {
    color: '#71717a',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 8,
    marginLeft: -16,
  },
});
