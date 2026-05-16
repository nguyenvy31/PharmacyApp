package vn.edu.hcmuaf.fit.pharmacityappbe.order.dto;


import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {

    private Integer userId;
    private String shippingAddress;
    private String receiverName;
    private String receiverPhone;
    private String note;
    private String promoCode;
    private String paymentMethod;
    private List<OrderItemDto> items;
    private boolean fromCart;

}
