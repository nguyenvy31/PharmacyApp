package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.DashboardDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.RecentOrderDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.RevenueDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto.RevenueSummaryDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.repository.OrderAdminRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.repository.InventoryRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final OrderAdminRepository orderRepo;
    private final InventoryRepository inventoryRepo;
    private final UserRepository userRepo;

    @Override
    public DashboardDto getDashboard() {
        RevenueSummaryDto revenueSummary = getRevenueSummary();

        return DashboardDto.builder()
                .todayRevenue(orderRepo.sumRevenueToday() == null ? 0 : orderRepo.sumRevenueToday())
                .newOrders(orderRepo.countOrdersToday() == null ? 0 : orderRepo.countOrdersToday())
                .lowStockProducts(inventoryRepo.countLowStock(10) == null ? 0 : inventoryRepo.countLowStock(10))
                .newCustomers(userRepo.countUsersToday() == null ? 0 : userRepo.countUsersToday())
                .totalRevenue(revenueSummary.getTotalRevenue())      // THÊM
                .monthlyRevenue(revenueSummary.getMonthlyRevenue())  // THÊM
                .build();
    }


    @Override
    public List<RecentOrderDto> getRecentOrders() {
        return orderRepo.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(o -> RecentOrderDto.builder()
                        .id(o.getId())
                        .code("DH" + String.format("%05d", o.getId()))
                        .customer(o.getReceiverName())
                        .phone(o.getReceiverPhone())
                        .total(o.getTotalAmount())
                        .status(o.getStatus())
                        .createdAt(o.getCreatedAt())
                        .build())
                .toList();
    }

    @Override
    public List<RevenueDto> getRevenue7Days() {
        LocalDateTime fromDate = LocalDate.now()
                .minusDays(7)
                .atStartOfDay();

        List<Object[]> raw = orderRepo.getRevenueLast7DaysRaw(fromDate);

        return raw.stream()
                .map(obj -> new RevenueDto(
                        ((java.sql.Date) obj[0]).toLocalDate(),
                        BigDecimal.valueOf(((Number) obj[1]).longValue())
                ))
                .toList();
    }

    // AdminDashboardServiceImpl.java
    @Override
    public RevenueSummaryDto getRevenueSummary() {
        // Tổng doanh thu
        Long totalRevenue = orderRepo.sumTotalRevenue();
        if (totalRevenue == null) totalRevenue = 0L;

        // Doanh thu tháng này
        Long monthlyRevenue = orderRepo.sumRevenueThisMonth();
        if (monthlyRevenue == null) monthlyRevenue = 0L;

        // Doanh thu tháng trước (để tính tăng trưởng)
        Long lastMonthRevenue = orderRepo.sumRevenueLastMonth();
        if (lastMonthRevenue == null) lastMonthRevenue = 0L;

        // Tính tỉ lệ tăng trưởng
        Double growthRate = 0.0;
        if (lastMonthRevenue > 0) {
            growthRate = ((monthlyRevenue - lastMonthRevenue) * 100.0) / lastMonthRevenue;
        }

        return RevenueSummaryDto.builder()
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .lastMonthRevenue(lastMonthRevenue)
                .growthRate(growthRate)
                .build();
    }




}
