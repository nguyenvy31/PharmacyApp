package vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AdminCustomerDetailDto {
    private int id;
    private String name;
    private String phone;
    private String email;
    private boolean verified;
    private long orders;
    private long spent;
    private LocalDateTime joined;
}


