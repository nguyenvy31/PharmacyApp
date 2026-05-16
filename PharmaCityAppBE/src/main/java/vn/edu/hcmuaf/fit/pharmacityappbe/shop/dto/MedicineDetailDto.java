package vn.edu.hcmuaf.fit.pharmacityappbe.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MedicineDetailDto {

    private Integer id;
    private String name;
    private String brand;
    private String description;
    private String ingredient;
    private String registrationNum;
    private String dosageForm;
    private String country;
    private String origin;
    private String packageInfo;
    private String manufacturer;
    private Long price;
    private String imageUrl;
    private String usageText;
    private Integer categoryId;
}