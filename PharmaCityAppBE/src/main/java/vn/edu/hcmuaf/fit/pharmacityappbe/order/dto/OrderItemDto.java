package vn.edu.hcmuaf.fit.pharmacityappbe.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OrderItemDto {
    private Integer medicineId;
    private String name;
    private Long unitPrice;
    private Integer quantity;
}