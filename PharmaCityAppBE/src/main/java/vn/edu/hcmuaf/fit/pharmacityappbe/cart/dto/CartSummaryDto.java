package vn.edu.hcmuaf.fit.pharmacityappbe.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CartSummaryDto {

    private List<CartItemDto> items;
    private Integer totalQuantity;
    private Long subtotal;
}