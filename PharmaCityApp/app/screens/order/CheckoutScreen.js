// app/screens/order/CheckoutScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../config/colors';
import { useCart } from '../../context/CartContext';
import api from '../../config/api';

const PAYMENT_METHODS = [
  { key: 'COD', label: 'Thanh toán khi nhận hàng (COD)' },
  { key: 'MOMO', label: 'Ví điện tử Momo' },
  { key: 'CARD', label: 'Thẻ tín dụng / Ghi nợ' },
];

export default function CheckoutScreen({ navigation, route }) {
  const { items: cartItems, subtotal: cartSubtotal, clearCart, addToCart, removeItem } = useCart();

  // Lấy tham số từ route (nếu là mua ngay)
  const { buyNowItem, isBuyNow } = route.params || {};

  // State cho items (có thể là từ giỏ hàng hoặc từ mua ngay)
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);

  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [discount, setDiscount] = useState(0);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Thêm state để biết đã load user xong
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // Sửa useEffect load user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('authUser');
        const tokenData = await AsyncStorage.getItem('authToken');

        if (!userData || !tokenData) {
          console.log("No user data found");
          setIsUserLoaded(true);
          return;
        }

        const parsed = JSON.parse(userData);
        setUserId(parsed.id);
        setToken(tokenData);
        setIsUserLoaded(true);
        console.log("User loaded, token:", tokenData.substring(0, 20) + "...");
      } catch (e) {
        console.log('Load user error', e);
        setIsUserLoaded(true);
      }
    };

    loadUser();
  }, []);

  // Sửa useEffect xử lý deep link - chờ token load xong
  useEffect(() => {
    const handleDeepLink = async (event) => {
      const url = event.url;
      console.log("=== DEEP LINK RECEIVED ===");
      console.log("URL: " + url);

      if (url && url.startsWith("myapp://payment-result")) {
        const params = new URLSearchParams(url.split('?')[1]);
        const orderId = params.get('orderId');
        const resultCode = params.get('resultCode');
        const paymentMethod = params.get('paymentMethod');

        console.log("OrderId:", orderId);
        console.log("ResultCode:", resultCode);
        console.log("PaymentMethod:", paymentMethod);

        if (orderId) {
          // ✅ Đợi token load xong mới xử lý
          await waitForToken();
          await handlePaymentResult(orderId, resultCode);
        }
      }
    };

    // Hàm chờ token được load
    const waitForToken = async () => {
      let retries = 0;
      while (!token && retries < 20) { // Chờ tối đa 2 giây
        console.log(`Waiting for token... retry ${retries + 1}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      if (!token) {
        console.log("Token still null after waiting");
        // Thử load lại user
        const tokenData = await AsyncStorage.getItem('authToken');
        if (tokenData) {
          setToken(tokenData);
          console.log("Token loaded manually");
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then(url => {
      if (url) {
        console.log("Initial URL:", url);
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, [token]); // ✅ Phụ thuộc vào token

 const handlePaymentResult = async (orderId, resultCode) => {
   console.log("=== START handlePaymentResult ===");
   console.log("OrderId:", orderId);
   console.log("ResultCode:", resultCode);

   let currentToken = token;
   if (!currentToken) {
     console.log("Token is null, reloading...");
     const tokenData = await AsyncStorage.getItem('authToken');
     if (!tokenData) {
       Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
       navigation.replace('Login');
       return;
     }
     currentToken = tokenData;
     setToken(tokenData);
   }

   try {
     setCheckoutLoading(true);

     const apiUrl = api.ORDER_DETAIL(orderId);
     console.log("Calling API:", apiUrl);

     const response = await fetch(apiUrl, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${currentToken}`,
         'Content-Type': 'application/json',
       }
     });

     if (!response.ok) {
       throw new Error(`HTTP ${response.status}`);
     }

     const data = await response.json();
     console.log("Order data:", data);
     console.log("Payment status:", data.paymentStatus);

     if (data.paymentStatus === "PAID") {
       console.log("✅ Payment successful");

       const needClearCart = await AsyncStorage.getItem("pendingClearCart");

       if (needClearCart === "true") {
         // ✅ Lấy danh sách sản phẩm đã mua và xóa từng cái
         const purchasedItemsStr = await AsyncStorage.getItem("purchasedItems");
         if (purchasedItemsStr) {
           const purchasedItems = JSON.parse(purchasedItemsStr);
           console.log("Removing purchased items:", purchasedItems);

           for (const medicineId of purchasedItems) {
             await removeItem(medicineId);
           }
           await AsyncStorage.removeItem("purchasedItems");
         }
         await AsyncStorage.removeItem("pendingClearCart");
         console.log("Purchased items removed from cart");
       }

       Alert.alert(
         "Thanh toán thành công! 🎉",
         `Đơn hàng #${orderId} đã được thanh toán thành công.`,
         [
           {
             text: "Về trang chủ",
             onPress: () => navigation.replace('HomeScreen'),
             style: "cancel"
           },
           {
             text: "Xem đơn hàng",
             onPress: () => navigation.replace('OrderDetail', { orderId })
           }
         ]
       );
     } else {
       console.log("❌ Payment failed. Status:", data.paymentStatus);
       Alert.alert(
         "Thanh toán thất bại",
         `Đơn hàng #${orderId} thanh toán không thành công. Vui lòng thử lại.`,
         [
           {
             text: "Thử lại",
             onPress: () => navigation.replace('Checkout')
           },
           {
             text: "Về trang chủ",
             onPress: () => navigation.replace('HomeScreen')
           }
         ]
       );
     }
   } catch (err) {
     console.error("Error:", err);
     Alert.alert("Lỗi", "Không thể kiểm tra trạng thái thanh toán");
   } finally {
     setCheckoutLoading(false);
     await AsyncStorage.removeItem("lastOrderId");
   }
 };



  // Khởi tạo items dựa trên nguồn (giỏ hàng hoặc mua ngay)
  useEffect(() => {
    if (isBuyNow && buyNowItem) {
      // Mua ngay: chỉ có 1 sản phẩm
      setItems([buyNowItem]);
      setSubtotal(buyNowItem.price * buyNowItem.qty);
    } else {
      // Thanh toán từ giỏ hàng - lấy từ route.params.selectedItems
      const selectedItemsFromCart = route.params?.selectedItems;
      if (selectedItemsFromCart && selectedItemsFromCart.length > 0) {
        setItems(selectedItemsFromCart);
        const total = selectedItemsFromCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        setSubtotal(total);
      } else {
        // Fallback: lấy từ cart context
        setItems(cartItems);
        setSubtotal(cartSubtotal);
      }
    }
  }, [isBuyNow, buyNowItem, cartItems, cartSubtotal, route.params?.selectedItems]);

  const shippingFee = subtotal >= 300000 ? 0 : 30000;
  const total = Math.max(0, subtotal + shippingFee - discount);

  // ================= LOAD USER =================
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('authUser');
        const tokenData = await AsyncStorage.getItem('authToken');

        if (!userData || !tokenData) return;

        const parsed = JSON.parse(userData);
        setUserId(parsed.id);
        setToken(tokenData);
      } catch (e) {
        console.log('Load user error', e);
      }
    };

    loadUser();
  }, []);

  // ================= FETCH ADDRESS =================
  const fetchAddresses = async () => {
    if (!userId || !token) return;

    try {
      setLoadingAddress(true);

      const res = await fetch(`${api.ADDRESSES}?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      let list;

      try {
        list = JSON.parse(text);
      } catch {
        console.log('JSON parse error:', text);
        return;
      }

      if (!Array.isArray(list)) {
        if (list.success) list = list.data;
        else return;
      }

      setAddresses(list);

      if (list.length === 0) return;

      const defaultAddr =
        list.find((a) => a.default || a.isDefault) || list[0];

      setReceiverName((prev) => prev || defaultAddr.fullname || '');
      setReceiverPhone((prev) => prev || defaultAddr.phone || '');
      setAddress((prev) => prev || defaultAddr.address || '');
    } catch (e) {
      console.log('Error fetchAddresses', e);
    } finally {
      setLoadingAddress(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId, token]);

  // ================= SELECT ADDRESS =================
  const handleSelectAddress = (item) => {
    setReceiverName(item.fullname || '');
    setReceiverPhone(item.phone || '');
    setAddress(item.address || '');
    setAddressModalVisible(false);
  };

  // ================= APPLY PROMO =================
  const applyPromo = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã khuyến mãi');
      return;
    }

    if (!token) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập');
      return;
    }

    try {
      setPromoLoading(true);
      setPromoError('');

      const res = await fetch(api.PROMO_VALIDATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: promoCode,
          orderAmount: subtotal,
        }),
      });

      const text = await res.text();
      console.log('PROMO RAW:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setPromoError('Lỗi dữ liệu từ server');
        return;
      }

      if (data.success === false || data.valid === false) {
        setDiscount(0);
        setPromoError(data.message || 'Mã không hợp lệ');
        return;
      }

      const discountValue = data.discount || data.data?.discount || 0;

      if (discountValue <= 0) {
        setDiscount(0);
        setPromoError('Mã không áp dụng');
        return;
      }

      setDiscount(discountValue);
    } catch (e) {
      console.log(e);
      setPromoError('Không thể kiểm tra mã');
    } finally {
      setPromoLoading(false);
    }
  };

  // ================= CHECKOUT =================
  const handleCheckout = async () => {
    if (!userId) {
      Alert.alert('Chưa đăng nhập');
      return;
    }

    if (!receiverName || !receiverPhone || !address) {
      Alert.alert('Thiếu thông tin');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống');
      return;
    }

    setCheckoutLoading(true);

    try {
      // Tạo danh sách sản phẩm để gửi lên server
      const orderItems = items.map(item => ({
        medicineId: item.id,
        quantity: item.qty,
        price: item.price
      }));

      const requestBody = {
        userId,
        shippingAddress: address,
        receiverName,
        receiverPhone,
        note: note || "",
        paymentMethod,
        promoCode: promoCode || null,
        items: orderItems,
        fromCart: !isBuyNow  // true nếu từ giỏ hàng, false nếu mua ngay
      };

      console.log("Request body:", JSON.stringify(requestBody, null, 2));

      const res = await fetch(api.ORDER_CHECKOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const order = await res.json();

      console.log("ORDER RESPONSE:", order);

      if (!order || !order.id) {
        Alert.alert("Lỗi", "Không tạo được đơn hàng");
        setCheckoutLoading(false);
        return;
      }

      // Trong handleCheckout, sửa phần CARD:
      if (paymentMethod === 'CARD') {
          try {
              await AsyncStorage.setItem("lastOrderId", order.id.toString());

              const paymentRes = await fetch(
                  `${api.VNPAY_CREATE}?orderId=${order.id}`,
                  {
                      headers: {
                          Authorization: `Bearer ${token}`,
                      },
                  }
              );

              const paymentData = await paymentRes.json();
              console.log("VNPAY RESPONSE:", paymentData);

              if (paymentData.paymentUrl) {
                  // ✅ Lưu danh sách sản phẩm cần xóa cho CARD
                  await AsyncStorage.setItem("pendingClearCart", !isBuyNow ? "true" : "false");
                  await AsyncStorage.setItem("purchasedItems", JSON.stringify(orderItems.map(i => i.medicineId)));

                  Linking.openURL(paymentData.paymentUrl);
              } else {
                  Alert.alert('Lỗi thanh toán', 'Không tạo được link VNPay');
                  setCheckoutLoading(false);
              }
          } catch (err) {
              console.log('VNPay fetch error:', err);
              Alert.alert('Lỗi VNPay', 'Không thể kết nối tới server thanh toán');
              setCheckoutLoading(false);
          }
          return;
      }

      if (paymentMethod === 'MOMO') {
          try {
              await AsyncStorage.setItem("lastOrderId", order.id.toString());

              const momoRes = await fetch(api.MOMO_CREATE, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                      orderId: order.id,
                      amount: total,
                  }),
              });

              const text = await momoRes.text();
              console.log('MOMO RAW RESPONSE:', text);

              if (!momoRes.ok) {
                  Alert.alert('Lỗi Momo', `Server trả lỗi ${momoRes.status}`);
                  setCheckoutLoading(false);
                  return;
              }

              const paymentData = JSON.parse(text);

              if (paymentData.paymentUrl) {
                  // ✅ Lưu danh sách sản phẩm cần xóa cho MOMO
                  await AsyncStorage.setItem("pendingClearCart", !isBuyNow ? "true" : "false");
                  await AsyncStorage.setItem("purchasedItems", JSON.stringify(orderItems.map(i => i.medicineId)));

                  Linking.openURL(paymentData.paymentUrl);
              } else {
                  Alert.alert('Lỗi thanh toán', paymentData.error || 'Không tạo được link Momo');
                  setCheckoutLoading(false);
              }
          } catch (err) {
              console.log('Momo fetch error:', err);
              Alert.alert('Lỗi Momo', 'Không thể kết nối tới server thanh toán');
              setCheckoutLoading(false);
          }
          return;
      }

      // ✅ COD: Chỉ xóa sản phẩm đã mua, không xóa toàn bộ
      Alert.alert('Thành công', 'Đặt hàng thành công!', [
        {
          text: 'Xem đơn',
          onPress: async () => {
            if (!isBuyNow) {
              // ✅ Chỉ xóa những sản phẩm đã mua, không xóa toàn bộ
              for (const item of items) {
                await removeItem(item.id);
              }
            }
            navigation.replace('OrderDetail', { orderId: order.id });
          },
        },
      ]);
    } catch (e) {
      console.log(e);
      Alert.alert('Lỗi server', e.message || 'Có lỗi xảy ra');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* A. Thông tin giao hàng */}
        <View style={styles.box}>
          <Text style={styles.title}>Thông tin giao hàng</Text>

          {loadingAddress && (
            <View style={{ marginBottom: 8 }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ marginTop: 4, fontSize: 12 }}>
                Đang tải địa chỉ từ sổ địa chỉ...
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.selectAddressBtn}
            onPress={() => setAddressModalVisible(true)}
          >
            <Text style={styles.selectAddressText}>
              Chọn địa chỉ giao hàng từ sổ địa chỉ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageAddressBtn}
            onPress={() => navigation.navigate('AddressBook')}
          >
            <Text style={styles.manageAddressText}>Quản lý sổ địa chỉ</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Họ tên người nhận</Text>
          <TextInput
            placeholder="Họ tên người nhận"
            style={styles.input}
            value={receiverName}
            onChangeText={setReceiverName}
          />

          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            placeholder="Số điện thoại người nhận"
            style={styles.input}
            value={receiverPhone}
            onChangeText={setReceiverPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Địa chỉ giao hàng</Text>
          <TextInput
            placeholder="Địa chỉ giao hàng"
            style={styles.input}
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>Ghi chú (không bắt buộc)</Text>
          <TextInput
            placeholder="Ghi chú"
            style={styles.input}
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* B. Phương thức thanh toán */}
        <View style={styles.box}>
          <Text style={styles.title}>Phương thức thanh toán</Text>
          {PAYMENT_METHODS.map((pm) => (
            <TouchableOpacity
              key={pm.key}
              style={styles.radioRow}
              onPress={() => setPaymentMethod(pm.key)}
            >
              <View style={styles.radioCircle}>
                {paymentMethod === pm.key && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>{pm.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* C. Khuyến mãi */}
        <View style={styles.box}>
          <Text style={styles.title}>Khuyến mãi</Text>

          <View style={{ flexDirection: 'row' }}>
            <TextInput
              placeholder="Nhập mã khuyến mãi"
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              value={promoCode}
              onChangeText={(t) => {
                setPromoCode(t);
                setDiscount(0);
                setPromoError('');
              }}
              autoCapitalize="characters"
            />

            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                justifyContent: 'center',
                borderRadius: 6,
              }}
              onPress={applyPromo}
              disabled={promoLoading}
            >
              {promoLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '600' }}>Áp dụng</Text>
              )}
            </TouchableOpacity>
          </View>

          {promoError ? (
            <Text style={{ color: 'red', marginTop: 6 }}>{promoError}</Text>
          ) : null}

          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text>Giảm giá</Text>
              <Text style={{ color: 'green' }}>
                -{discount.toLocaleString('vi-VN')} đ
              </Text>
            </View>
          )}
        </View>

        {/* D. Tóm tắt sản phẩm */}
        <View style={styles.box}>
          <Text style={styles.title}>Sản phẩm</Text>
          {items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <Text style={{ flex: 1 }}>
                {it.qty} × {it.name}
              </Text>
              <Text>{(it.price * it.qty).toLocaleString('vi-VN')} đ</Text>
            </View>
          ))}
          <View style={styles.summaryRow}>
            <Text>Tạm tính</Text>
            <Text>{subtotal.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Phí vận chuyển</Text>
            <Text>{shippingFee.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Khuyến mãi</Text>
            <Text>-{discount.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ fontWeight: 'bold' }}>Tổng cộng</Text>
            <Text style={{ fontWeight: 'bold', color: colors.accent }}>
              {total.toLocaleString('vi-VN')} đ
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.orderButton, checkoutLoading && { opacity: 0.6 }]}
          onPress={handleCheckout}
          disabled={checkoutLoading}
        >
          <Text style={styles.orderButtonText}>Đặt hàng</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal chọn địa chỉ - giữ nguyên */}
      <Modal
        visible={addressModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn địa chỉ giao hàng</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Text style={styles.modalClose}>Đóng</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {addresses.length === 0 && (
                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                  <Text>Chưa có địa chỉ nào.</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setAddressModalVisible(false);
                      navigation.navigate('AddressBook');
                    }}
                  >
                    <Text
                      style={{
                        marginTop: 8,
                        color: colors.primary,
                        fontWeight: '600',
                      }}
                    >
                      Thêm địa chỉ mới
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {addresses.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.addressCard}
                  onPress={() => handleSelectAddress(item)}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={styles.addrName}>{item.fullname}</Text>
                    {(item.default || item.isDefault) && (
                      <Text style={styles.addrBadge}>Mặc định</Text>
                    )}
                  </View>
                  <Text style={styles.addrText}>{item.phone}</Text>
                  <Text style={styles.addrText}>{item.address}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },
  box: {
    backgroundColor: 'white',
    margin: 12,
    padding: 12,
    borderRadius: 10,
  },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  label: {
    marginTop: 8,
    fontSize: 13,
    color: '#555',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 5,
  },
  selectAddressBtn: {
    paddingVertical: 6,
  },
  selectAddressText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  manageAddressBtn: {
    marginBottom: 8,
  },
  manageAddressText: {
    color: colors.primary,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioDot: {
    width: 10,
    height: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  radioLabel: { fontSize: 14 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  orderButton: {
    backgroundColor: colors.accent,
    margin: 12,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  orderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  modalClose: { color: colors.primary, fontWeight: '600' },
  addressCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  addrName: { fontSize: 14, fontWeight: '600', color: '#333' },
  addrText: { marginTop: 3, fontSize: 13, color: '#555' },
  addrBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#e3f2fd',
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
});