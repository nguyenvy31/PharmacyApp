package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderDetailDto {
    private Integer id;
    private String code;
    private String status;
    private LocalDateTime createdAt;

    private String customerName;
    private String customerPhone;
    private String shippingAddress;
    private String note;

    private List<OrderItemDto> items;

    private Long subtotal;
    private Long shippingFee;
    private Long discount;
    private Long total;

}
