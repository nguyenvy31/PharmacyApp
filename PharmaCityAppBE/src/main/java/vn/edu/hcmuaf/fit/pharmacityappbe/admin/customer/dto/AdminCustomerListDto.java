package vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AdminCustomerListDto {
    private int id;
    private String name;
    private String phone;
    private long orders;
    private long spent;
    private LocalDateTime joined;
}
