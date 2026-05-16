import AsyncStorage from '@react-native-async-storage/async-storage';

export const authFetch = async (url, options = {}, navigation) => {
  const token = await AsyncStorage.getItem('authToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });


  if (res.status === 401) {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('authUser');

    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }

    throw new Error('UNAUTHORIZED');
  }

  return res;
};