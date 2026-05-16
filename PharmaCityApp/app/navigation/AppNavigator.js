// app/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth screens
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Shop screens (phần sản phẩm)
import SearchScreen from '../screens/shop/SearchScreen';
import CategoriesScreen from '../screens/shop/CategoriesScreen';
import ProductListScreen from '../screens/shop/ProductListScreen';
import ProductDetailScreen from '../screens/shop/ProductDetailScreen';
import ChatBotScreen from "../screens/shop/ChatBotScreen";
import HomeScreen from '../screens/shop/HomeScreen';

import CheckoutScreen from '../screens/order/CheckoutScreen';
import OrderListScreen from '../screens/order/OrderListScreen';
import OrderDetailScreen from '../screens/order/OrderDetailScreen';

import ProfileScreen from '../screens/profile/ProfileScreen';
import AddressBookScreen from '../screens/profile/AddressBookScreen';
import EditAddressScreen from '../screens/profile/EditAddressScreen';
import PromotionListScreen from '../screens/profile/PromotionListScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';


// Bottom tab
import MainTabNavigator from './MainTabNavigator';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Auth flow */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OTPScreen" component={OTPScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

          <Stack.Screen name="HomeScreen" component={HomeScreen} />

          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="OrderList" component={OrderListScreen} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />

           {/* Profile & addresses */}
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="AddressBook" component={AddressBookScreen} />
                    <Stack.Screen name="EditAddress" component={EditAddressScreen} />
                    <Stack.Screen name="Promotion" component={PromotionListScreen} />
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          {/* Main app dùng bottom tab */}
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />

          {/* Các màn “phụ” được push từ trong MainTabs */}
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="ProductList" component={ProductListScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen
            name="ChatBot"
            component={ChatBotScreen}
            options={{ title: "PharmaBot tư vấn thuốc" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
