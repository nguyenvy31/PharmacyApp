// app/screens/profile/EditAddressScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../config/colors';
import api from '../../config/api';

export default function EditAddressScreen({ route, navigation }) {
  const address = route.params?.address;

  const [userId, setUserId] = useState(null);

  const [fullname, setFullname] = useState(address?.fullname || '');
  const [phone, setPhone] = useState(address?.phone || '');

  const [houseStreet, setHouseStreet] = useState(
    address?.address?.split(',')[0]?.trim() || ''
  );

  const [isDefault, setIsDefault] = useState(address?.default || false);

  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  // 🔥 FIX: dùng '' thay vì null
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  // ================= LOAD USER =================
  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('authUser');
      if (!userData) return;

      const parsed = JSON.parse(userData);
      setUserId(parsed.id);
    };

    loadUser();
  }, []);

  // ================= LOAD PROVINCES =================
  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const res = await fetch(api.PROVINCES);
      const json = await res.json();
      setProvinces(json);
    } catch (e) {
      console.log(e);
      Alert.alert('Lỗi', 'Không tải được tỉnh');
    }
  };

  // ================= FETCH WARDS =================
  const fetchWardsByProvince = async (provinceCode) => {
    if (!provinceCode) return;

    try {
      console.log("SELECT PROVINCE:", provinceCode);

      const res = await fetch(api.PROVINCE_DETAIL(provinceCode));
      const json = await res.json();

      console.log("PROVINCE DETAIL:", json);

      let flat = [];

      // 🔥 FIX CHÍNH: ƯU TIÊN wards trực tiếp
      if (Array.isArray(json.wards)) {
        flat = json.wards.map((w) => ({
          code: w.code,
          wardName: w.name,
          label: w.name,
        }));
      }
      // 🔥 fallback nếu API khác format
      else if (Array.isArray(json.districts)) {
        flat = json.districts.flatMap((d) =>
          (d.wards || []).map((w) => ({
            code: w.code,
            wardName: w.name,
            label: w.name,
          }))
        );
      }

      console.log("WARDS LENGTH:", flat.length);

      setWards(flat);
      setSelectedWard('');

    } catch (e) {
      console.log(e);
      Alert.alert('Lỗi', 'Không tải được phường');
    }
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
      return;
    }

    if (!fullname || !phone || !houseStreet) {
      Alert.alert('Thiếu thông tin');
      return;
    }

    const provinceObj = provinces.find(p => p.code === selectedProvince);
    const wardObj = wards.find(w => w.code === selectedWard);

    if (!provinceObj || !wardObj) {
      Alert.alert('Chọn tỉnh/phường');
      return;
    }

    const fullAddress = `${houseStreet}, ${wardObj.wardName}, ${provinceObj.name}`;

    try {
      const token = await AsyncStorage.getItem('authToken');

      const url = address?.id
        ? `${api.ADDRESSES}/${address.id}?userId=${userId}`
        : `${api.ADDRESSES}?userId=${userId}`;

      const method = address?.id ? 'PUT' : 'POST';

      console.log('CALL:', url);

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullname,
          phone,
          address: fullAddress,
          isDefault,
        }),
      });

      console.log('STATUS:', res.status);

      const text = await res.text();
      console.log('RAW:', text);

      if (!res.ok) {
        Alert.alert('Lỗi', 'Không lưu được');
        return;
      }

      navigation.goBack();

    } catch (e) {
      console.log(e);
      Alert.alert('Lỗi', 'Không kết nối server');
    }
  };

  // ================= UI =================
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.label}>Họ tên</Text>
        <TextInput style={styles.input} value={fullname} onChangeText={setFullname} />

        <Text style={styles.label}>SĐT</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} />

        <Text style={styles.label}>Số nhà</Text>
        <TextInput style={styles.input} value={houseStreet} onChangeText={setHouseStreet} />

        {/* ===== PROVINCE ===== */}
        <Text style={styles.label}>Tỉnh</Text>
        <Picker
          selectedValue={selectedProvince}
          onValueChange={(v) => {
            setSelectedProvince(v);
            fetchWardsByProvince(v);
          }}
        >
          <Picker.Item label="Chọn tỉnh" value="" />
          {provinces.map(p => (
            <Picker.Item key={p.code} label={p.name} value={p.code} />
          ))}
        </Picker>

        {/* ===== WARD ===== */}
        <Text style={styles.label}>Phường</Text>
        <Picker
          key={wards.length} // 🔥 force re-render
          selectedValue={selectedWard}
          onValueChange={setSelectedWard}
        >
          <Picker.Item label="Chọn phường" value="" />
          {wards.map(w => (
            <Picker.Item key={w.code} label={w.label} value={w.code} />
          ))}
        </Picker>

        {/* DEBUG */}
        {wards.length === 0 && (
          <Text style={{ color: 'red' }}>Không có dữ liệu phường</Text>
        )}

        <View style={styles.row}>
          <Text>Mặc định</Text>
          <Switch value={isDefault} onValueChange={setIsDefault} />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Lưu</Text>
      </TouchableOpacity>
    </View>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary, padding: 12 },
  box: { backgroundColor: 'white', padding: 12, borderRadius: 10 },
  label: { marginTop: 8 },
  input: { backgroundColor: '#eee', padding: 8, borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  saveButton: {
    marginTop: 16,
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: { color: 'white', fontWeight: 'bold' },
});