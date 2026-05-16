package vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.dto.InventoryItemDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.service.InventoryService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
public class InventoryAdminController {

    private final InventoryService inventoryService;

    // GET inventory list
    @GetMapping
    public List<InventoryItemDto> getInventory() {
        return inventoryService.getInventory();
    }

    // PATCH nhập hàng nhanh
    @PatchMapping("/medicine/{medicineId}/restock")
    public void restock(
            @PathVariable Integer medicineId,
            @RequestParam Integer qty
    ) {
        inventoryService.restock(medicineId, qty);
    }

}

