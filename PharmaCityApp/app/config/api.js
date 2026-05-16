//const BASE_URL = 'http://192.168.102.89:8080/api/v1';
const BASE_URL = 'http://10.0.2.2:8080/api/v1';
//const BASE_URL = 'http://172.20.10.9:8080/api/v1';
export const BASE_UPLOAD_URL = 'http://10.0.2.2:8080';
export default {
  BASE_URL,

  // ---------- AUTH ----------
  AUTH_REGISTER: `${BASE_URL}/auth/register`,
  AUTH_LOGIN: `${BASE_URL}/auth/login`,
  AUTH_LOGIN_EMAIL: `${BASE_URL}/auth/login-email`,
  AUTH_VERIFY_OTP: `${BASE_URL}/auth/verify-otp`,
  AUTH_RESEND_OTP: `${BASE_URL}/auth/resend-otp`,
  AUTH_FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
  AUTH_RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
  AUTH_GET_USER: (id) => `${BASE_URL}/auth/user/${id}`,
  AUTH_UPDATE_USER: (id) => `${BASE_URL}/auth/user/${id}`,
  AUTH_LOGIN_GOOGLE: `${BASE_URL}/auth/login-google`,
  AUTH_LOGIN_FACEBOOK: `${BASE_URL}/auth/login-facebook`,



  // ADDRESS BOOK
  ADDRESSES: `${BASE_URL}/addresses`,

  // ---------- PRODUCT ----------
  CATEGORIES: `${BASE_URL}/categories`,
  MEDICINES: `${BASE_URL}/medicines`,

  // ---------- CART ----------
  CART: `${BASE_URL}/cart`,
  CART_ITEMS: `${BASE_URL}/cart/items`,



  // ---------- ORDER ----------
  ORDERS: `${BASE_URL}/orders`,
  ORDER_CHECKOUT: `${BASE_URL}/orders/checkout`,
  ORDER_HISTORY: (userId) => `${BASE_URL}/orders/history?userId=${userId}`,
  ORDER_DETAIL: (orderId) => `${BASE_URL}/orders/${orderId}`,
  CANCEL_ORDER: (id) => `${BASE_URL}/orders/${id}/cancel`,

  // ---------- PAYMENT ----------
  VNPAY_CREATE: `${BASE_URL}/payment/vnpay/create`,
  MOMO_CREATE: `${BASE_URL}/payment/momo/create-momo`,

  // ---------- CHATBOT ----------
  CHAT_SEARCH: `${BASE_URL}/chat/search`,

  // ---------- PROMOTION ----------
  PROMO_VALIDATE: `${BASE_URL}/promotions/validate`,

    // ---------- REVIEWS ----------
    REVIEWS: `${BASE_URL}/reviews`,
    REVIEW_BY_MEDICINE: (medicineId) => `${BASE_URL}/reviews/medicine/${medicineId}`,
    REVIEW_SUMMARY: (medicineId) => `${BASE_URL}/reviews/medicine/${medicineId}/summary`,

    // ---------- LOCATION (tỉnh/thành VN public API) ----------
       // Danh sách tất cả tỉnh/thành
       PROVINCES: 'https://provinces.open-api.vn/api/v2/p',
       // Chi tiết 1 tỉnh, gồm cả phường/xã (qua các district)
       PROVINCE_DETAIL: (code) =>
         `https://provinces.open-api.vn/api/v2/p/${code}?depth=2`


};
