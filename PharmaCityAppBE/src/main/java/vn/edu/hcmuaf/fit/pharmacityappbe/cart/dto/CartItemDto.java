package vn.edu.hcmuaf.fit.pharmacityappbe.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CartItemDto {
    private Integer id;      // medicineId
    private String name;
    private Long price;
    private String imageUrl;
    private Integer qty;
}