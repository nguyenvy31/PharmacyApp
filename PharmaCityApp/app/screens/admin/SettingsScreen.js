import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import colors from '../../config/colors';
import api from '../../config/api';

export default function SettingsScreen() {
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [shippingFee, setShippingFee] = useState('');

  useEffect(() => {
    // TODO load settings from backend
    setStoreName('Nhà thuốc ABC');
    setPhone('0900000000');
    setAddress('27B Lê Lợi, Q1, TP.HCM');
    setShippingFee('30000');
  }, []);

  const handleSave = () => {
    // TODO call backend
    Alert.alert('Lưu', 'Cài đặt đã được lưu (mock).');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.secondary }}>
      <View style={{ backgroundColor: 'white', margin: 12, padding: 12, borderRadius: 10 }}>
        <Text style={{ fontWeight: '700' }}>Thông tin cửa hàng</Text>
        <Text style={{ marginTop: 8 }}>Tên nhà thuốc</Text>
        <TextInput style={styles.input} value={storeName} onChangeText={setStoreName} />
        <Text style={{ marginTop: 8 }}>SĐT liên hệ</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Text style={{ marginTop: 8 }}>Địa chỉ</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} />
      </View>

      <View style={{ backgroundColor: 'white', margin: 12, padding: 12, borderRadius: 10 }}>
        <Text style={{ fontWeight: '700' }}>Cài đặt giao hàng</Text>
        <Text style={{ marginTop: 8 }}>Phí ship mặc định</Text>
        <TextInput style={styles.input} value={shippingFee} onChangeText={setShippingFee} keyboardType="numeric" />
      </View>

      <View style={{ marginHorizontal: 12 }}>
        <TouchableOpacity style={{ backgroundColor: colors.accent, padding: 12, borderRadius: 8 }} onPress={handleSave}>
          <Text style={{ color: 'white', textAlign: 'center' }}>Lưu cài đặt</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 8, marginTop: 4 },
});
