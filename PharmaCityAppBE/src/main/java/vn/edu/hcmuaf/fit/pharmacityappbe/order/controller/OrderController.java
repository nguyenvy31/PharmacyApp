package vn.edu.hcmuaf.fit.pharmacityappbe.order.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.dto.CreateOrderRequest;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.dto.OrderDetailDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*")
@Tag(name = "Order", description = "RESTful API cho đơn hàng")
public class    OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Tạo đơn hàng từ giỏ hiện tại")
    @PostMapping("/checkout")
    public OrderDetailDto checkout(@RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @Operation(summary = "Danh sách đơn hàng của 1 user")
    @GetMapping
    public List<OrderDetailDto> getOrders(@RequestParam Integer userId) {
        return orderService.getOrders(userId);
    }

    @Operation(summary = "Chi tiết 1 đơn hàng")
    @GetMapping("/{id}")
    public OrderDetailDto getOrder(@PathVariable Integer id) {
        return orderService.getOrder(id);
    }

    @PutMapping("/{id}/cancel")
    public void cancelOrder(@PathVariable Integer id,
                            @AuthenticationPrincipal Integer userId) {

        orderService.cancelOrder(id, userId);
    }
}

