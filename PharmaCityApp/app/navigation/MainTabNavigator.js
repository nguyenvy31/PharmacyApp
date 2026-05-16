// app/navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from '../screens/shop/HomeScreen';
import CartScreen from '../screens/cart/CartScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import colors from '../config/colors';
import AdminNavigator from './AdminNavigator';
import { useCart } from '../context/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const { totalQuantity } = useCart();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem('authUser');
      if (data) setUser(JSON.parse(data));
    };
    loadUser();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        unmountOnBlur: true,
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#777',
        tabBarStyle: { backgroundColor: '#fff' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: 'Giỏ hàng',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🛒</Text>,
          tabBarBadge: totalQuantity > 0 ? totalQuantity : undefined,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => <Text style={{ color }}>👤</Text>,
        }}
      />
      {user?.role === 'ROLE_ADMIN' && (
        <Tab.Screen
          name="Admin"
          component={AdminNavigator}
          options={{
            title: 'Admin',
            tabBarIcon: ({ color }) => <Text style={{ color }}>🧑‍💼</Text>,
          }}
        />
      )}
    </Tab.Navigator>
  );
}
