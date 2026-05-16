// app/components/MedicineCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../config/colors';
import { Alert } from 'react-native';

export default function MedicineCard({ item, onPress, onAddToCart }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={{ color: colors.primary, fontSize: 12 }}>No Image</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.name}>
          {item.name}
        </Text>
        {item.brand ? (
          <Text numberOfLines={1} style={styles.brand}>
            {item.brand}
          </Text>
        ) : null}
        {item.price != null && (
          <Text style={styles.price}>
            {item.price.toLocaleString('vi-VN')} đ
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.cartButton}
        activeOpacity={0.7}
        onPress={async () => {
          try {
            await onAddToCart();

            Alert.alert(
              "Thành công",
              "Đã thêm vào giỏ hàng 🛒"
            );

          } catch (err) {
            console.log(err);

            Alert.alert(
              "Thất bại",
              "Không thể thêm vào giỏ hàng"
            );
          }
        }}
      >
        <Text style={styles.cartText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 8,
    margin: 6,
    elevation: 2,
    shadowColor: '#000',
  },
  image: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#f5f5f5',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { marginTop: 6 },
  name: { fontSize: 13, fontWeight: '600', color: '#333' },
  brand: { fontSize: 11, color: '#777', marginTop: 2 },
  price: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db' // Đổi từ colors.accent thành xanh dương
  },
  cartButton: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#3498db', // Đổi từ colors.accent thành xanh dương
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartText: { color: 'white', fontWeight: 'bold', fontSize: 18, marginTop: -2 },
});