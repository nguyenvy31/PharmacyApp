package vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.service;

import vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.dto.InventoryItemDto;

import java.util.List;

public interface InventoryService {
    List<InventoryItemDto> getInventory();
    void restock(Integer medicineId, Integer qty);
}
