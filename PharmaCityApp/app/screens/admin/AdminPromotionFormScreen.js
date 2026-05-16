import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import colors from '../../config/colors';
import api from '../../config/adminApi';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { authFetch } from '../../utils/authFetch';


export default function AdminPromotionFormScreen({ route, navigation }) {
  const promotion = route.params?.promotion;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [expireDate, setExpireDate] = useState(
    promotion?.expireAt ? new Date(promotion.expireAt) : null
  );
  const [code, setCode] = useState(promotion?.code || '');
  const [type, setType] = useState(promotion?.type || 'PERCENT');
  const [value, setValue] = useState(String(promotion?.value || ''));
  const [minOrderValue, setMinOrderValue] = useState(
    String(promotion?.minOrderValue || '0')
  );
  const [maxDiscount, setMaxDiscount] = useState(
    promotion?.maxDiscount ? String(promotion.maxDiscount) : ''
  );
  const [quantity, setQuantity] = useState(
    String(promotion?.quantity || '')
  );
  const [expireAt, setExpireAt] = useState(
    promotion?.expireAt || ''
  );
  const [active, setActive] = useState(promotion?.active ?? true);

  const formatDateTime = (date) => {
    if (!date) return null;

    const pad = (n) => n.toString().padStart(2, '0');

    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes())
    );
  };


  const save = async () => {
    if (!code || !value || !quantity) {
      Alert.alert('Lỗi', 'Thiếu thông tin bắt buộc');
      return;
    }

    try {
      const body = {
        code,
        type,
        value: Number(value),
        minOrderValue: Number(minOrderValue),
        maxDiscount: type === 'PERCENT' ? Number(maxDiscount || 0) : null,
        quantity: Number(quantity),
        expireAt: expireDate ? formatDateTime(expireDate) : null,
        active,
      };

      const url = promotion
        ? api.ADMIN_UPDATE_PROMOTION(promotion.id)
        : api.ADMIN_CREATE_PROMOTION;

      const res = await authFetch(
        url,
        {
          method: promotion ? 'PUT' : 'POST',
          body: JSON.stringify(body),
        },
        navigation
      );

      if (!res.ok) {
        const msg = await res.text();
        Alert.alert('Thất bại', msg || 'Không thể lưu khuyến mãi');
        return;
      }

      Alert.alert('Thành công', 'Đã lưu khuyến mãi', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);

    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mã khuyến mãi</Text>
      <TextInput style={styles.input} value={code} onChangeText={setCode} />

      <Text style={styles.label}>Loại khuyến mãi</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setType('PERCENT')}>
          <Text style={type === 'PERCENT' ? styles.active : styles.inactive}>
            %
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setType('FIXED')}>
          <Text style={type === 'FIXED' ? styles.active : styles.inactive}>
            đ
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Giá trị</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={value}
        onChangeText={setValue}
      />

      <Text style={styles.label}>Đơn tối thiểu</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={minOrderValue}
        onChangeText={setMinOrderValue}
      />

      {type === 'PERCENT' && (
        <>
          <Text style={styles.label}>Giảm tối đa</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={maxDiscount}
            onChangeText={setMaxDiscount}
          />
        </>
      )}

      <Text style={styles.label}>Số lượng</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <Text style={styles.label}>Hết hạn</Text>

      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>
          {expireDate
            ? formatDateTime(expireDate)
            : 'Chọn ngày giờ hết hạn'}
        </Text>
      </TouchableOpacity>

     {showDatePicker && (
       <DateTimePicker
         value={expireDate || new Date()}
         mode="date"
         display="default"
         onChange={(event, selectedDate) => {
           setShowDatePicker(false);

           if (event.type === 'set' && selectedDate) {
             const current = expireDate || new Date();
             selectedDate.setHours(current.getHours());
             selectedDate.setMinutes(current.getMinutes());
             setExpireDate(selectedDate);
             setShowTimePicker(true); // 👉 mở picker giờ
           }
         }}
       />
     )}

     {showTimePicker && (
       <DateTimePicker
         value={expireDate || new Date()}
         mode="time"
         display="default"
         onChange={(event, selectedTime) => {
           setShowTimePicker(false);

           if (event.type === 'set' && selectedTime) {
             const current = expireDate || new Date();
             current.setHours(selectedTime.getHours());
             current.setMinutes(selectedTime.getMinutes());
             setExpireDate(new Date(current));
           }
         }}
       />
     )}



      <View style={styles.switchRow}>
        <Text>Kích hoạt</Text>
        <Switch value={active} onValueChange={setActive} />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={{ color: 'white', fontWeight: '700' }}>Lưu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  label: { marginTop: 10, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  row: { flexDirection: 'row', gap: 20, marginTop: 6 },
  active: { fontWeight: '700', color: colors.primary, fontSize: 16 },
  inactive: { color: '#999', fontSize: 16 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
});
