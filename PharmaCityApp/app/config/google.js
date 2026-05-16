// config/google.js
import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * Cấu hình Google Sign-In
 * - webClientId: Lấy từ Firebase / Google Cloud -> Android Web Client ID
 * - offlineAccess: bắt buộc nếu muốn lấy refresh token
 * - forceCodeForRefreshToken: nên có
 * - scopes: email và profile
 */
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '878332080976-qn2jqgop39a2m3eiej14qq7ekdebvgmj.apps.googleusercontent.com',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
    scopes: ['email', 'profile'],
  });

  console.log('✅ Google Sign-In configured');
};

/**
 * Thực hiện đăng nhập Google
 * - Kiểm tra Google Play Services
 * - Sign in và lấy idToken
 */
export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const userInfo = await GoogleSignin.signIn();

    // ❌ Sai: const idToken = userInfo.idToken;
    // ✅ Đúng:
    const idToken = userInfo?.data?.idToken;

    if (!idToken) {
      throw new Error('Không nhận được ID token từ Google');
    }

    return idToken;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};


/**
 * Optional: signOut trước khi signIn (giúp debug tài khoản cũ)
 */
export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    console.log('✅ Signed out from Google');
  } catch (error) {
    console.warn('⚠️ Google Sign-Out error:', error.message);
  }
};
