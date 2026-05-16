package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecentOrderDto {
    private Integer id;
    private String code;
    private String customer;
    private String phone;
    private Long total;
    private String status;
    private LocalDateTime createdAt;
}

