package vn.edu.hcmuaf.fit.pharmacityappbe.promotion.dto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CheckoutRequest {
    private Long userId;
    private String shippingAddress;
    private String receiverName;
    private String receiverPhone;
    private String note;
    private String paymentMethod;
    private String promoCode;
}

