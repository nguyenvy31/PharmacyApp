package vn.edu.hcmuaf.fit.pharmacityappbe.order.entity;

public enum OrderStatus {
    PENDING,        // chờ xử lý
    PROCESSING,     // đang xử lý
    SHIPPING,       // đang giao hàng
    COMPLETED,      // đã hoàn thành
    CANCELLED       // đã hủy
}

