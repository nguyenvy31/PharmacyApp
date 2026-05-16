package vn.edu.hcmuaf.fit.pharmacityappbe.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Size(min = 9, max = 20)
    private String phone;

    @NotBlank
    @Email
    private String email;   // 👈 thêm email

    @NotBlank
    @Size(min = 6)
    private String password;

    // getters & setters
}