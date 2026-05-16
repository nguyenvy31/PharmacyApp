import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import colors from '../../config/colors';

export default function OnboardingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào mừng đến MediCare</Text>
      <Text style={styles.subtitle}>Tìm thuốc nhanh chóng, tư vấn dược sĩ, giao hàng tận nơi</Text>
      <Button title="Bắt đầu" onPress={() => navigation.replace('Login')} color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
});
