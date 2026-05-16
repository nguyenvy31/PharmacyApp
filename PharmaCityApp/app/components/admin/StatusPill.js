import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const statusColors = {
  PENDING: '#ffb74d',
  CONFIRMED: '#42a5f5',
  PREPARING: '#29b6f6',
  SHIPPING: '#ab47bc',
  COMPLETED: '#66bb6a',
  CANCELED: '#ef5350',
};

export default function StatusPill({ status }) {
  const color = statusColors[status] || '#90a4ae';
  return (
    <View style={[styles.pill, { backgroundColor: color + '33' }]}>
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
