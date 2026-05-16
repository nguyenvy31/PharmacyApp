package vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InventoryItemDto {
    private Integer id;
    private String name;
    private Integer stock;
    private Long soldToday;
    private Long soldWeek;


}
