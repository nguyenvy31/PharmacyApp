package vn.edu.hcmuaf.fit.pharmacityappbe.auth.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// UserDto.java
@Getter @Setter
@AllArgsConstructor
public class UserDto {
    private int id;
    private String name;
    private String phone;
    private String email;
    private boolean verified;
    private String role;
}
