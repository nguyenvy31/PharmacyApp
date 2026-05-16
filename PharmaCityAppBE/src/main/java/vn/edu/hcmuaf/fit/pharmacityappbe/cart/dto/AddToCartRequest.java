package vn.edu.hcmuaf.fit.pharmacityappbe.cart.dto;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Integer userId;
    private Integer medicineId;
    private Integer qty;   // nếu null thì mặc định = 1
}