// app/context/CartContext.js
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // -------------------- Đồng bộ từ server --------------------
  const syncFromServer = (data) => {
    if (!data) return;
    // data có thể là mảng trực tiếp hoặc object chứa items
    setItems(Array.isArray(data) ? data : data.items || []);
  };

  // -------------------- Load cart --------------------
  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setItems([]);
        return;
      }

      setLoading(true);
      const res = await fetch(api.CART, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.log('fetchCart failed:', res.status);
        return;
      }

      const data = await res.json();
      console.log('Cart API response:', data);
      syncFromServer(data.data || data.items || []);
    } catch (e) {
      console.log('Error fetchCart', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // -------------------- Thêm vào giỏ --------------------
  const addToCart = async (product) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('Chưa đăng nhập');
        return;
      }

      const res = await fetch(api.CART_ITEMS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicineId: product.id,
          qty: 1,
        }),
      });

      if (!res.ok) {
        console.log('addToCart failed:', res.status);
        return;
      }

      const data = await res.json();
      console.log('Cart API response (addToCart):', data);
      syncFromServer(data.data || data.items || []);
    } catch (e) {
      console.log('Error addToCart', e);
    }
  };

  // -------------------- Cập nhật số lượng --------------------
  const updateQty = async (id, qty) => {
    if (qty <= 0) return removeItem(id); // Nếu qty <= 0 thì xoá luôn
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch(api.CART_ITEMS, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicineId: id,
          qty,
        }),
      });

      if (!res.ok) {
        console.log('updateQty failed:', res.status);
        return;
      }

      const data = await res.json();
      syncFromServer(data.data || data.items || []);
    } catch (e) {
      console.log('Error updateQty', e);
    }
  };

  // -------------------- Xoá item --------------------
  const removeItem = async (id) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch(`${api.CART_ITEMS}?medicineId=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.log('removeItem failed:', res.status);
        return;
      }

      const data = await res.json();
      syncFromServer(data.data || data.items || []);
    } catch (e) {
      console.log('Error removeItem', e);
    }
  };

  // -------------------- Xoá toàn bộ giỏ --------------------
  const clearCart = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setItems([]);
        return;
      }

      const res = await fetch(api.CART, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok && res.status !== 204) {
        console.log('clearCart failed:', res.status);
        return;
      }

      setItems([]);
    } catch (e) {
      console.log('Error clearCart', e);
    }
  };

  // -------------------- Tính toán --------------------
  const totalQuantity = useMemo(
    () => items.reduce((sum, it) => sum + (it.qty || 0), 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0),
        0
      ),
    [items]
  );

  const value = {
    items,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    totalQuantity,
    subtotal,
    loading,
    reloadCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}