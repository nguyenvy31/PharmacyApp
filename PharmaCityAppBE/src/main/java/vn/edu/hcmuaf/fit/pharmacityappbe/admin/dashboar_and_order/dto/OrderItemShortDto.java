package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemShortDto {
    private String name;
    private Integer qty;
}

