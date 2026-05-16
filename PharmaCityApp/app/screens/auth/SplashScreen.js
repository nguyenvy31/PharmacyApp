import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../config/colors';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MediCare</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
