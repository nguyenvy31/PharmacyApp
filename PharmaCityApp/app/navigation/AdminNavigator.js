import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/admin/DashboardScreen';
import OrdersScreen from '../screens/admin/OrdersScreen';
import OrderDetailScreen from '../screens/admin/OrderDetailScreen';
import ProductsScreen from '../screens/admin/ProductsScreen';
import ProductFormScreen from '../screens/admin/ProductFormScreen';
import AdminCategoryScreen from '../screens/admin/AdminCategoryScreen';
import InventoryScreen from '../screens/admin/InventoryScreen';
import CustomersScreen from '../screens/admin/CustomersScreen';
import CustomerDetailScreen from '../screens/admin/CustomerDetailScreen';
import RevenueStatsScreen from '../screens/admin/RevenueStatsScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';
import AdminPromotionsScreen from '../screens/admin/AdminPromotionsScreen';
import AdminPromotionFormScreen from '../screens/admin/AdminPromotionFormScreen';


const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminDashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminOrders"
        component={OrdersScreen}
        options={{ title: 'Quản lý đơn hàng' }}
      />
      <Stack.Screen
        name="AdminOrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Chi tiết đơn hàng' }}
      />
      <Stack.Screen
        name="AdminProducts"
        component={ProductsScreen}
        options={{ title: 'Quản lý sản phẩm' }}
      />
      <Stack.Screen
        name="AdminProductForm"
        component={ProductFormScreen}
        options={{ title: 'Sản phẩm' }}
      />
      <Stack.Screen
        name="AdminCategory"
        component={AdminCategoryScreen}
        options={{ title: 'Quản lý loại thuốc' }}
      />
      <Stack.Screen
        name="AdminInventory"
        component={InventoryScreen}
        options={{ title: 'Quản lý kho' }}
      />
      <Stack.Screen
        name="AdminCustomers"
        component={CustomersScreen}
        options={{ title: 'Khách hàng' }}
      />
      <Stack.Screen
              name="CustomerDetail"
              component={CustomerDetailScreen}
              options={{ title: 'Chi Tiết Khách hàng' }}
      />
      <Stack.Screen
        name="AdminPromotions"
        component={AdminPromotionsScreen}
        options={{ title: 'Quản lý khuyến mãi' }}
      />
      <Stack.Screen
        name="AdminPromotionForm"
        component={AdminPromotionFormScreen}
        options={{ title: 'Khuyến mãi' }}
      />
      <Stack.Screen
        name="RevenueStats"
        component={RevenueStatsScreen}
        options={{ title: 'Báo cáo & Thống kê' }}
      />
      <Stack.Screen
        name="AdminSettings"
        component={SettingsScreen}
        options={{ title: 'Cài đặt quản trị' }}
      />
    </Stack.Navigator>
  );
}
