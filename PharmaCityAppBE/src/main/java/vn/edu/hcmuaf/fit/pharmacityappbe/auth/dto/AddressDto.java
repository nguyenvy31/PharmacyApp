package vn.edu.hcmuaf.fit.pharmacityappbe.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddressDto {
    private Integer id;
    private Integer userId;
    private String fullname;
    private String phone;
    private String address;
    private boolean isDefault;
}
