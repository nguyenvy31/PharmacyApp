// app/services/ChatStorage.js
// Thay thế SQLite bằng AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@chat_history';

export const initDB = async () => {
  try {
    console.log('Chat storage initialized with AsyncStorage');
    return true;
  } catch (err) {
    console.log("initDB error", err);
    return false;
  }
};

export const saveMessages = async (messages) => {
  try {
    const data = JSON.stringify(messages);
    await AsyncStorage.setItem(STORAGE_KEY, data);
    console.log('Messages saved successfully');
  } catch (err) {
    console.log("saveMessages error", err);
  }
};

export const loadMessages = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (err) {
    console.log("loadMessages error", err);
    return [];
  }
};

export const clearMessages = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('Messages cleared successfully');
  } catch (err) {
    console.log("clearMessages error", err);
  }
};