package vn.edu.hcmuaf.fit.pharmacityappbe.admin.medicine.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminMedicineListDto {

    private Integer id;
    private String name;
    private String brand;
    private Long price;
    private Integer stock;
    private String imageUrl;
    private String categoryName;
}
