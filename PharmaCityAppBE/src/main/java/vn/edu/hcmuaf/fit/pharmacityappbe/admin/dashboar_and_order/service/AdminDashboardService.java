package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.service;

import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.DashboardDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.RecentOrderDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.RevenueDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.RevenueSummaryDto;

import java.util.List;

public interface AdminDashboardService {
    DashboardDto getDashboard();
    List<RecentOrderDto> getRecentOrders();
    List<RevenueDto> getRevenue7Days();
    RevenueSummaryDto getRevenueSummary();

}
