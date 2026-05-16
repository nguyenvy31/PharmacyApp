package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;


@Data
@AllArgsConstructor
public class RevenueDto {
    private LocalDate date;
    private BigDecimal revenue;
}

