package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.OrderDetailDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.OrderListDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.service.AdminOrderService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService orderService;

    @GetMapping
    public List<OrderListDto> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        return orderService.getOrders(status, search);
    }

    @GetMapping("/{id}")
    public OrderDetailDto getOrderDetail(@PathVariable Integer id) {
        return orderService.getOrderDetail(id);
    }

    @PutMapping("/{id}/status")
    public void updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam String status
    ) {
        orderService.updateStatus(id, status);
    }
}
