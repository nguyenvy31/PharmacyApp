package vn.edu.hcmuaf.fit.pharmacityappbe.cart.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.cart.dto.AddToCartRequest;
import vn.edu.hcmuaf.fit.pharmacityappbe.cart.dto.CartSummaryDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.cart.dto.UpdateCartItemRequest;
import vn.edu.hcmuaf.fit.pharmacityappbe.cart.service.CartService;

@RestController
@RequestMapping("/api/v1/cart")
@CrossOrigin(origins = "*")
@Tag(name = "Cart", description = "RESTful API cho giỏ hàng")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Lấy userId từ token
    private int getUserIdFromAuth(Authentication auth) {
        return (int) auth.getPrincipal();
    }

    @Operation(summary = "Lấy giỏ hàng của user đang login")
    @GetMapping
    public CartSummaryDto getCart(Authentication auth) {
        int userId = getUserIdFromAuth(auth);
        return cartService.getCart(userId);
    }

    @Operation(summary = "Thêm thuốc vào giỏ")
    @PostMapping("/items")
    public CartSummaryDto addToCart(Authentication auth, @RequestBody AddToCartRequest request) {
        int userId = getUserIdFromAuth(auth);
        request.setUserId(userId); // Gán userId từ token
        return cartService.addToCart(request);
    }

    @Operation(summary = "Cập nhật số lượng 1 item trong giỏ")
    @PutMapping("/items")
    public CartSummaryDto updateItem(Authentication auth, @RequestBody UpdateCartItemRequest request) {
        int userId = getUserIdFromAuth(auth);
        request.setUserId(userId); // Gán userId từ token
        return cartService.updateItem(request);
    }

    @Operation(summary = "Xoá 1 thuốc khỏi giỏ")
    @DeleteMapping("/items")
    public CartSummaryDto removeItem(
            Authentication auth,
            @RequestParam Integer medicineId
    ) {
        int userId = getUserIdFromAuth(auth);
        return cartService.removeItem(userId, medicineId);
    }

    @Operation(summary = "Xoá toàn bộ giỏ hàng")
    @DeleteMapping
    public void clearCart(Authentication auth) {
        int userId = getUserIdFromAuth(auth);
        cartService.clearCart(userId);
    }
}