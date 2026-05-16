import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import colors from '../../config/colors';
import api from '../../config/api';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ProductDetailScreen({ route }) {
  const { medicineId } = route.params || {};
  const { addToCart } = useCart();
  const navigation = useNavigation();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState(null);
  const [summary, setSummary] = useState({ average: 0, total: 0 });
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    loadUser();
    loadProduct();
  }, [medicineId]);

  const loadUser = async () => {
    const userJson = await AsyncStorage.getItem("authUser");
    if (userJson) setCurrentUser(JSON.parse(userJson));
  };

  const loadProduct = async () => {
    try {
      const res = await fetch(`${api.MEDICINES}/${medicineId}`);
      const data = await res.json();
      setProduct(data);
      await loadReviews();
    } catch (e) {
      console.log(e);
    }
  };

  const calculateSummary = (reviews) => {
    if (!reviews.length) return { average: 0, total: 0 };
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return { average: sum / total, total };
  };

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await fetch(api.REVIEW_BY_MEDICINE(medicineId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReviews(data || []);
      setSummary(calculateSummary(data || []));
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (!result.didCancel && result.assets) setImage(result.assets[0]);
  };

 const handleSubmitReview = async () => {
   const userJson = await AsyncStorage.getItem("authUser");
   const token = await AsyncStorage.getItem("authToken");

   if (!userJson || !token) {
     Alert.alert("Bạn cần đăng nhập");
     return;
   }

   const user = JSON.parse(userJson);

   let imageUrl = null;

   if (image) {
     imageUrl = await uploadToCloudinary(image.uri);

     if (!imageUrl) {
       Alert.alert("Upload ảnh thất bại");
       return;
     }
   }

   try {
     const res = await fetch(api.REVIEWS, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify({
         userId: user.id,
         medicineId,
         rating,
         comment,
         imageUrl,
       }),
     });

     const data = await res.json();

     if (res.ok) {
       let msg = data.message;

       Alert.alert("Thông báo", msg);
       setComment("");
       setImage(null);
       setRating(5);
       await loadReviews();
     } else {
       alert(data.message);
     }
   } catch (err) {
     console.log(err);
     alert("Lỗi kết nối server");
   }
 };

  const handleDeleteReview = async (reviewId) => {
    const userJson = await AsyncStorage.getItem("authUser");
    const user = JSON.parse(userJson);
    const token = await AsyncStorage.getItem("authToken");

    try {
      const res = await fetch(`${api.REVIEWS}/${reviewId}?userId=${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) await loadReviews();
    } catch (err) {
      alert("Lỗi kết nối server");
    }
  };

  const handleAddToCart = async () => {
    const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập", [
          {
            text: "Đăng nhập",
            onPress: () => navigation.navigate("Login"),
          },
          { text: "Huỷ" }
        ]);
        return;
      }
    try {
      await addToCart({ ...product, qty });
      Alert.alert("Thành công", "Sản phẩm đã được thêm vào giỏ");
      setQty(1);
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", "Không thể thêm vào giỏ");
    }
  };

  const uploadToCloudinary = async (uri) => {
    const data = new FormData();

    data.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'review.jpg',
    });

    data.append('upload_preset', 'pharmacity_upload');
    data.append('cloud_name', 'dkumfanx2');

    try {
      const res = await fetch(
        'https://api.cloudinary.com/v1_1/dkumfanx2/image/upload',
        {
          method: 'POST',
          body: data,
        }
      );

      const json = await res.json();

      if (!json.secure_url) {
        throw new Error("Upload fail");
      }
      return json.secure_url;

    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const handleBuyNow = async () => {
    const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập", [
          {
            text: "Đăng nhập",
            onPress: () => navigation.navigate("Login"),
          },
          { text: "Huỷ" }
        ]);
        return;
      }
    try {

      const selectedProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        qty: qty,
        stock: product.stock
      };

      navigation.navigate('Checkout', {
        buyNowItem: selectedProduct,
        isBuyNow: true
      });
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", "Không thể mua ngay");
    }
  };

  if (!product) return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text>Đang tải...</Text>
    </View>
  );

  const priceText = product.price != null ? `${product.price.toLocaleString('vi-VN')} đ` : 'Liên hệ';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.imageWrapper}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}><Text>No Image</Text></View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{product.name}</Text>
          {product.brand && <Text style={styles.brand}>{product.brand}</Text>}
          <View style={styles.priceRow}><Text style={styles.price}>{priceText}</Text></View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Công dụng</Text>
            <Text style={styles.sectionText}>{product.description || 'Đang cập nhật'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đánh giá sản phẩm</Text>
            <Text style={styles.summary}>⭐ {summary.average.toFixed(1)} ({summary.total} đánh giá)</Text>
            <View style={styles.starRow}>{[1,2,3,4,5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Text style={styles.star}>{s <= rating ? "⭐" : "☆"}</Text>
              </TouchableOpacity>
            ))}</View>
            <TextInput placeholder="Nhập đánh giá của bạn..." value={comment} onChangeText={setComment} style={styles.commentInput} multiline />
            <TouchableOpacity style={styles.imagePickBtn} onPress={pickImage}><Text>Chọn ảnh</Text></TouchableOpacity>
            {image && <Image source={{ uri: image.uri }} style={styles.preview} />}
            <TouchableOpacity style={styles.reviewButton} onPress={handleSubmitReview}><Text style={styles.reviewButtonText}>Gửi đánh giá</Text></TouchableOpacity>

            {loadingReviews ? <ActivityIndicator size="small" color={colors.primary} /> : (
              reviews.map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <Text style={styles.reviewUser}>{r.userName || "Người dùng"}</Text>
                  <Text style={styles.reviewStar}>{'⭐'.repeat(r.rating)}</Text>
                  <Text style={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.reviewComment}>{r.comment}</Text>
                  {r.imageUrl && (
                    <Image
                      source={{ uri: r.imageUrl }}
                      style={styles.reviewImage}
                    />
                  )}
                  {currentUser && r.userId === currentUser.id && (
                    <TouchableOpacity onPress={() => handleDeleteReview(r.id)} style={styles.deleteBtn}>
                      <Text style={styles.deleteText}>Xoá</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>

        {/* Số lượng */}
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.qtyValue}>{qty}</Text>

          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => setQty((q) => q + 1)}
          >
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Thêm vào giỏ */}
        <TouchableOpacity
          style={styles.cartIconBtn}
          onPress={handleAddToCart}
        >
          <Text style={{ fontSize: 22 }}>🛒</Text>
        </TouchableOpacity>

        {/* Mua ngay */}
        <TouchableOpacity
          style={styles.buyButton}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyText}>Mua ngay</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },
  imageWrapper: { backgroundColor: 'white', padding: 16 },
  image: { height: 220, resizeMode: 'contain', backgroundColor: '#f5f5f5', borderRadius: 10 },
  content: { padding: 12 },
  name: { fontSize: 18, fontWeight: '700', color: '#333' },
  brand: { fontSize: 13, color: '#777', marginTop: 4 },
  priceRow: { marginTop: 10 },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498db' // Đổi từ colors.accent thành xanh dương
  },
  section: { marginTop: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  sectionText: { fontSize: 13, color: '#444' },
  summary: { marginBottom: 10 },
  starRow: { flexDirection: "row", marginBottom: 8 },
  star: { fontSize: 22, marginRight: 5 },
  commentInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, minHeight: 70 },
  imagePickBtn: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#eee",
    alignItems: "center",
    borderRadius: 6
  },
  preview: { width: 100, height: 100, marginTop: 8, borderRadius: 6 },
  reviewButton: {
    marginTop: 10,
    backgroundColor: '#3498db', // Đổi từ colors.primary thành xanh dương
    padding: 10,
    borderRadius: 8,
    alignItems: "center"
  },
  reviewButtonText: { color: "white", fontWeight: "bold" },
  reviewCard: { marginTop: 15, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10 },
  reviewUser: { fontWeight: "bold" },
  reviewStar: { marginTop: 2 },
  reviewDate: { fontSize: 12, color: "#777" },
  reviewComment: { marginTop: 5 },
  reviewImage: { width: 90, height: 90, marginTop: 6, borderRadius: 6 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center'
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center'
  },
  qtyText: { fontSize: 18 },
  qtyValue: { marginHorizontal: 10, fontSize: 16 },
  buyButton: {
    flex: 1,
    backgroundColor: '#3498db', // Đổi từ colors.accent thành xanh dương
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buyText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  deleteBtn: { marginTop: 6, alignSelf: "flex-start" },
  deleteText: { color: "red", fontSize: 13 },
  cartIconBtn: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#3498db', // Đổi từ '#FFA500' (cam) thành xanh dương
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
});