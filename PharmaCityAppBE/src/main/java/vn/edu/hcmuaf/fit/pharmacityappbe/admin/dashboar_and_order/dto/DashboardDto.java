package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardDto {
    private int todayRevenue;
    private int newOrders;
    private int lowStockProducts;
    private int newCustomers;
    private Long totalRevenue;
    private Long monthlyRevenue;
}

