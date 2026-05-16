import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../config/colors';

export default function StatCard({ label, value, subLabel, color }) {
  return (
    <View style={[styles.card, { borderLeftColor: color || colors.primary }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subLabel ? <Text style={styles.subLabel}>{subLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    margin: 6,
    borderLeftWidth: 4,
    elevation: 2,
  },
  label: { fontSize: 12, color: '#777' },
  value: { fontSize: 18, fontWeight: '700', marginTop: 4, color: '#333' },
  subLabel: { fontSize: 11, color: '#999', marginTop: 2 },
});
