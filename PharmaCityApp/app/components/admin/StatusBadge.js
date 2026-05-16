import React from 'react';
import { View, Text } from 'react-native';

const getStatusText = (status) => {
  const statusMap = {
    PENDING: 'Chờ xác nhận',
    PREPARING: 'Đang chuẩn bị',
    SHIPPING: 'Đang giao hàng',
    COMPLETED: 'Đã giao hàng',
    CANCELED: 'Đã hủy',
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    PENDING: '#ff9800',
    PREPARING: '#2196f3',
    SHIPPING: '#9c27b0',
    COMPLETED: '#4caf50',
    CANCELED: '#f44336',
  };
  return colorMap[status] || '#757575';
};

export default function StatusBadge({ status, styles }) {
  const statusText = getStatusText(status);
  const statusColor = getStatusColor(status);

  return (
    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      <Text style={[styles.statusText, { color: statusColor }]}>
        {statusText}
      </Text>
    </View>
  );
}