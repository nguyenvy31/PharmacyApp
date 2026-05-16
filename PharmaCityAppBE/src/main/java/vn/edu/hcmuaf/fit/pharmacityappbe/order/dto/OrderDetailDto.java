    package vn.edu.hcmuaf.fit.pharmacityappbe.order.dto;

    import lombok.AllArgsConstructor;
    import lombok.Data;

    import java.time.LocalDateTime;
    import java.util.List;

    @Data
    @AllArgsConstructor
    public class OrderDetailDto {

        private Integer id;
        private String code;
        private Integer userId;
        private Long totalAmount;
        private Long shippingFee;
        private Long discountAmount;
        private String promoCode;
        private String shippingAddress;
        private String receiverName;
        private String receiverPhone;
        private String note;
        private String status;
        private String paymentStatus;
        private LocalDateTime createdAt;
        private List<OrderItemDto> items;
    }
