package vn.edu.hcmuaf.fit.pharmacityappbe.admin.medicine.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.entity.Inventory;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.repository.InventoryRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.medicine.dto.AdminMedicineDetailDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.medicine.dto.AdminMedicineListDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.entity.Medicine;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.repository.CategoryRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.repository.MedicineRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminMedicineService {

    private final MedicineRepository medicineRepo;
    private final InventoryRepository inventoryRepo;
    private final CategoryRepository categoryRepository;

    public List<AdminMedicineListDto> getAllForAdmin() {
        return medicineRepo.findAll()
                .stream()
                .map(m -> {
                    int stock = inventoryRepo
                            .findByMedicineId(m.getId())
                            .map(Inventory::getStock)
                            .orElse(0);

                    String categoryName = m.getCategoryId() == null ? null :
                            categoryRepository.findById(m.getCategoryId())
                                    .map(cat -> cat.getName())
                                    .orElse(null);

                    return new AdminMedicineListDto(
                            m.getId(),
                            m.getName(),
                            m.getBrand(),
                            m.getPrice(),
                            stock,
                            m.getImageUrl(),
                            categoryName
                    );
                })
                .toList();
    }

    public AdminMedicineDetailDto getDetail(Integer id) {
        Medicine m = medicineRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        return toDetailDto(m);
    }

    public AdminMedicineDetailDto create(AdminMedicineDetailDto dto) {
        Medicine m = new Medicine();
        applyDto(m, dto);
        Medicine saved = medicineRepo.save(m);

        Inventory inventory = new Inventory();
        inventory.setMedicine(saved);
        inventory.setStock(dto.getStock() != null ? dto.getStock() : 0);
        inventoryRepo.save(inventory);

        return toDetailDto(saved);
    }

    public AdminMedicineDetailDto update(Integer id, AdminMedicineDetailDto dto) {
        Medicine m = medicineRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        applyDto(m, dto);
        Medicine saved = medicineRepo.save(m);

        inventoryRepo.findByMedicineId(id).ifPresent(inv -> {
            inv.setStock(dto.getStock());
            inventoryRepo.save(inv);
        });

        return toDetailDto(saved);
    }

    public void delete(Integer id) {
        medicineRepo.deleteById(id);
    }

    private AdminMedicineDetailDto toDetailDto(Medicine m) {
        AdminMedicineDetailDto dto = new AdminMedicineDetailDto();
        dto.setId(m.getId());
        dto.setName(m.getName());
        dto.setBrand(m.getBrand());
        dto.setIngredient(m.getIngredient());
        dto.setRegistrationNum(m.getRegistrationNum());
        dto.setDosageForm(m.getDosageForm());
        dto.setCountry(m.getCountry());
        dto.setOrigin(m.getOrigin());
        dto.setPackageInfo(m.getPackageInfo());
        dto.setManufacturer(m.getManufacturer());
        dto.setPrice(m.getPrice());
        dto.setUsageText(m.getUsageText());
        dto.setDescription(m.getDescription());
        dto.setCategoryId(m.getCategoryId());
        dto.setImageUrl(m.getImageUrl());

        // Lấy stock
        inventoryRepo.findByMedicineId(m.getId())
                .ifPresent(inv -> dto.setStock(inv.getStock()));

        // Lấy category name
        if (m.getCategoryId() != null) {
            categoryRepository.findById(m.getCategoryId())
                    .ifPresent(cat -> dto.setCategoryName(cat.getName()));
        }

        return dto;
    }

    private void applyDto(Medicine m, AdminMedicineDetailDto dto) {
        m.setName(dto.getName());
        m.setBrand(dto.getBrand());
        m.setIngredient(dto.getIngredient());
        m.setRegistrationNum(dto.getRegistrationNum());
        m.setDosageForm(dto.getDosageForm());
        m.setCountry(dto.getCountry());
        m.setOrigin(dto.getOrigin());
        m.setPackageInfo(dto.getPackageInfo());
        m.setManufacturer(dto.getManufacturer());
        m.setPrice(dto.getPrice());
        m.setUsageText(dto.getUsageText());
        m.setDescription(dto.getDescription());
        m.setCategoryId(dto.getCategoryId());
        m.setImageUrl(dto.getImageUrl());
    }
}