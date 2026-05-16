package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.OrderDetailDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.OrderItemDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.OrderItemShortDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.OrderListDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.repository.OrderAdminRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.repository.InventoryRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.entity.Order;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminOrderServiceImpl implements AdminOrderService {

    private final OrderAdminRepository orderRepo;
    private final InventoryRepository inventoryRepository;

    @Override
    public List<OrderListDto> getOrders(String status, String search) {

        List<Order> orders = orderRepo.search(status, search);

        return orders.stream()
                .map(o -> OrderListDto.builder()
                        .id(o.getId())
                        .code("DH" + String.format("%05d", o.getId()))
                        .createdAt(o.getCreatedAt())
                        .customer(o.getReceiverName())
                        .phone(o.getReceiverPhone())
                        .items(o.getItems().stream()
                                .map(i -> OrderItemShortDto.builder()
                                        .name(i.getMedicine().getName())
                                        .qty(i.getQuantity())
                                        .build())
                                .toList())
                        .total(o.getTotalAmount())
                        .status(o.getStatus())
                        .build())
                .toList();
    }


    @Override
    public OrderDetailDto getOrderDetail(Integer id) {

        Order o = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        long subtotal = o.getItems().stream()
                .mapToLong(i -> i.getUnitPrice() * i.getQuantity())
                .sum();

        return OrderDetailDto.builder()
                .id(o.getId())
                .code("DH" + String.format("%05d", o.getId()))
                .status(o.getStatus())
                .createdAt(o.getCreatedAt())
                .customerName(o.getReceiverName())
                .customerPhone(o.getReceiverPhone())
                .shippingAddress(o.getShippingAddress())
                .note(o.getNote())
                .items(o.getItems().stream()
                        .map(i -> OrderItemDto.builder()
                                .id(i.getId())
                                .name(i.getMedicine().getName())
                                .unitPrice(i.getUnitPrice())
                                .qty(i.getQuantity())
                                .build())
                        .toList())
                .subtotal(subtotal)
                .shippingFee(o.getShippingFee())
                .discount(0L)
                .total(o.getTotalAmount())
                .build();
    }

    @Override
    public void updateStatus(Integer id, String status) {
        Order o = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("COMPLETED".equals(o.getStatus())) {
            throw new RuntimeException("Không thể hủy đơn đã hoàn thành");
        }

        if ("CANCELED".equals(status)) {
            o.getItems().forEach(item -> {
                Integer medicineId = item.getMedicine().getId();
                Integer qty = item.getQuantity();

                inventoryRepository.findByMedicineId(medicineId)
                        .ifPresent(inv -> {
                            inv.setStock(inv.getStock() + qty);
                            inventoryRepository.save(inv);
                        });
            });
        }

        o.setStatus(status);
        orderRepo.save(o);
    }
}
