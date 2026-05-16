package vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.service;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.dto.InventoryItemDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.repository.InventoryRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepo;

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItemDto> getInventory() {
        LocalDate today = LocalDate.now();
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        return inventoryRepo.getInventory(today, sevenDaysAgo);
    }


    @Override
    public void restock(Integer medicineId, Integer qty) {
        if (qty == null || qty <= 0) {
            throw new IllegalArgumentException("Số lượng nhập phải > 0");
        }
        inventoryRepo.addStock(medicineId, qty);
    }
}
