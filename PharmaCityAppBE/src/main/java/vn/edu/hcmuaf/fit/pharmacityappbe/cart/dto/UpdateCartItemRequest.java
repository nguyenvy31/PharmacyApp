package vn.edu.hcmuaf.fit.pharmacityappbe.cart.dto;

import lombok.Data;

@Data
public class UpdateCartItemRequest {
    private Integer userId;
    private Integer medicineId;
    private Integer qty;
}
