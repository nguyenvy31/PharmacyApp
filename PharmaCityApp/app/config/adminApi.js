    //const BASE_URL = 'http://192.168.102.89:8080/api/admin';
    const BASE_URL = 'http://10.0.2.2:8080/api/admin';

    export default {
      // Dashboard
      DASHBOARD: `${BASE_URL}/dashboard`,
      DASHBOARD_RECENT_ORDERS: `${BASE_URL}/dashboard/recent-orders`,
      DASHBOARD_REVENUE_7_DAYS: `${BASE_URL}/dashboard/revenue-7-days`,

      // Orders
      ORDERS: `${BASE_URL}/orders`,
      ORDER_DETAIL: (id) => `${BASE_URL}/orders/${id}`,
      UPDATE_ORDER_STATUS: (id) => `${BASE_URL}/orders/${id}/status`,
      //Revenue
      DASHBOARD_REVENUE_SUMMARY: `${BASE_URL}/dashboard/revenue-summary`,

       //Inventory
       INVENTORY_LIST: `${BASE_URL}/inventory`,
       INVENTORY_RESTOCK: (medicineId) => `${BASE_URL}/inventory/medicine/${medicineId}/restock`,

       //Medicine

       // Danh sách thuốc (ProductsScreen)
       ADMIN_MEDICINES: `${BASE_URL}/medicines`,

       // Chi tiết thuốc (load form sửa)
       ADMIN_MEDICINE_DETAIL: (id) =>
           `${BASE_URL}/medicines/${id}`,

       // Tạo thuốc mới
       ADMIN_CREATE_MEDICINE: `${BASE_URL}/medicines`,

       // Cập nhật thuốc
       ADMIN_UPDATE_MEDICINE: (id) =>
           `${BASE_URL}/medicines/${id}`,

       // (Optional) Xóa thuốc
       ADMIN_DELETE_MEDICINE: (id) =>
           `${BASE_URL}/medicines/${id}`,

        // Category endpoints
         ADMIN_CATEGORIES: `${BASE_URL}/categories`,
         ADMIN_CREATE_CATEGORY: `${BASE_URL}/categories`,
         ADMIN_UPDATE_CATEGORY: (id) => `${BASE_URL}/categories/${id}`,
         ADMIN_DELETE_CATEGORY: (id) => `${BASE_URL}/categories/${id}`,

       ADMIN_CUSTOMERS: `${BASE_URL}/customers`,
       ADMIN_CUSTOMER_DETAIL: (id) => `${BASE_URL}/customers/${id}`,

       // Promotions
       ADMIN_PROMOTIONS: `${BASE_URL}/promotions`,
       ADMIN_PROMOTION_DETAIL: (id) => `${BASE_URL}/promotions/${id}`,
       ADMIN_CREATE_PROMOTION: `${BASE_URL}/promotions`,
       ADMIN_UPDATE_PROMOTION: (id) => `${BASE_URL}/promotions/${id}`,
       ADMIN_TOGGLE_PROMOTION: (id) => `${BASE_URL}/promotions/${id}/toggle`,
       ADMIN_DELETE_PROMOTION: (id) => `${BASE_URL}/promotions/${id}`,

    };
