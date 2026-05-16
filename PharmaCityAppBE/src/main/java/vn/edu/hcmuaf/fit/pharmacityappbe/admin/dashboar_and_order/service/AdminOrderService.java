package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.service;

import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.OrderDetailDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.OrderListDto;

import java.util.List;

public interface AdminOrderService {
    List<OrderListDto> getOrders(String status, String search);
    OrderDetailDto getOrderDetail(Integer id);
    void updateStatus(Integer id, String status);
}

