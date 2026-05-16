import React from 'react';
import AppNavigator from './app/navigation/AppNavigator';
import { CartProvider } from './app/context/CartContext';

export default function App() {
  return (
    <CartProvider>
      <AppNavigator />
    </CartProvider>
  );
}
