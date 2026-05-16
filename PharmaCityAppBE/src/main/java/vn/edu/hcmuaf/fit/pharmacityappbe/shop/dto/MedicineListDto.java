package vn.edu.hcmuaf.fit.pharmacityappbe.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MedicineListDto {
    private Integer id;
    private String name;
    private String brand;
    private Long price;
    private String imageUrl;
}