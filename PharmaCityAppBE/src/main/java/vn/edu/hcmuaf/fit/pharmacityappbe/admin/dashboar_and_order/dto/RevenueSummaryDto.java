package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueSummaryDto {
    private Long totalRevenue;      // Tổng doanh thu
    private Long monthlyRevenue;    // Doanh thu tháng này
    private Long lastMonthRevenue;  // Doanh thu tháng trước (để so sánh)
    private Double growthRate;      // Tỉ lệ tăng trưởng
}