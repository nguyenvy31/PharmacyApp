package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDto {
    private Integer id;
    private String name;
    private Long unitPrice;
    private Integer qty;
}

