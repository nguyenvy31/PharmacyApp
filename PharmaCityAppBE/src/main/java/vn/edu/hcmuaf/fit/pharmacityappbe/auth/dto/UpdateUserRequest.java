package vn.edu.hcmuaf.fit.pharmacityappbe.auth.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String name;
    private String phone;
    private String email;
    private String address; // tùy chọn
}
