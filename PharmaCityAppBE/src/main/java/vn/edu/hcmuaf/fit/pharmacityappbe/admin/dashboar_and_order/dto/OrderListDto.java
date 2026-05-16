package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderListDto {
    private Integer id;
    private String code;
    private LocalDateTime createdAt;
    private String customer;
    private String phone;
    private List<OrderItemShortDto> items;
    private Long total;
    private String status;
}


