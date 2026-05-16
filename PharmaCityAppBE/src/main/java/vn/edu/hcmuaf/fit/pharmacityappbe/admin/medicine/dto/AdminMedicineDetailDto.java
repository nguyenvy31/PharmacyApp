package vn.edu.hcmuaf.fit.pharmacityappbe.admin.medicine.dto;

import lombok.Data;

@Data
public class AdminMedicineDetailDto {

    private Integer id;
    private String name;
    private String brand;
    private String ingredient;
    private String registrationNum;
    private String dosageForm;
    private String country;
    private String origin;
    private String packageInfo;
    private String manufacturer;
    private Long price;
    private String usageText;
    private String description;
    private Integer categoryId;
    private String categoryName;
    private String imageUrl;
    private Integer stock;
}
