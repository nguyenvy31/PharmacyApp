import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

export const signInWithFacebook = async () => {
  try {
    const result = await LoginManager.logInWithPermissions([
      'public_profile'
    ]);

    if (result.isCancelled) {
      console.log('Facebook login cancelled');
      return null;
    }

    const data = await AccessToken.getCurrentAccessToken();
    console.log('FB TOKEN FULL:', data);


    if (!data) {
      throw new Error('Không lấy được Facebook access token');
    }

    return data.accessToken.toString();
  } catch (error) {
    console.log('Facebook login error:', error);
    return null;
  }
};
