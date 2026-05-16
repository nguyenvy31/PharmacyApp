package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.DashboardDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.RecentOrderDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.RevenueDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.RevenueSummaryDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.service.AdminDashboardService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping
    public DashboardDto getDashboard() {
        return dashboardService.getDashboard();
    }

    @GetMapping("/recent-orders")
    public List<RecentOrderDto> getRecentOrders() {
        return dashboardService.getRecentOrders();
    }

    @GetMapping("/revenue-7-days")
    public List<RevenueDto> getRevenue7Days() {
        return dashboardService.getRevenue7Days();
    }

    @GetMapping("/revenue-summary")
    public RevenueSummaryDto getRevenueSummary() {
        return dashboardService.getRevenueSummary();
    }
}
