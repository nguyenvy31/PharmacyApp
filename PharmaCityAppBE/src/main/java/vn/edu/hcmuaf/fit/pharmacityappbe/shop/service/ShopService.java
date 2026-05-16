package vn.edu.hcmuaf.fit.pharmacityappbe.shop.service;

import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.dto.CategoryDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.dto.MedicineDetailDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.dto.MedicineListDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.entity.Category;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.entity.Medicine;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.repository.CategoryRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.repository.MedicineRepository;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ShopService {

    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;

    public ShopService(CategoryRepository categoryRepository, MedicineRepository medicineRepository) {
        this.categoryRepository = categoryRepository;
        this.medicineRepository = medicineRepository;
    }

    // ============= CATEGORY =============
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(c -> new CategoryDto(c.getId(), c.getName()))
                .collect(Collectors.toList());
    }

    // ============= MEDICINE LIST =============
    public List<MedicineListDto> getMedicines(
            Integer categoryId,
            String search,
            String sort,
            Integer limit,
            Integer page
    ) {
        List<Medicine> medicines;

        // 1️⃣ Lọc theo từ khóa hoặc category
        if (search != null && !search.isBlank()) {
            medicines = medicineRepository.searchByKeyword(search.trim());
        } else if (categoryId != null) {
            medicines = medicineRepository.findByCategoryId(categoryId);
        } else {
            medicines = medicineRepository.findAll();
        }

        // 2️⃣ Sort
        if (sort == null) sort = "popular";
        switch (sort) {
            case "price_asc" -> medicines.sort(Comparator.comparing(
                    Medicine::getPrice, Comparator.nullsLast(Long::compareTo)
            ));
            case "price_desc" -> medicines.sort(Comparator.comparing(
                    Medicine::getPrice, Comparator.nullsLast(Long::compareTo)
            ).reversed());
            case "newest" -> medicines.sort(Comparator.comparing(
                    Medicine::getId, Comparator.nullsLast(Integer::compareTo)
            ).reversed());
            case "popular" -> {
                // tạm thời coi giống newest
                medicines.sort(Comparator.comparing(
                        Medicine::getId, Comparator.nullsLast(Integer::compareTo)
                ).reversed());
            }
        }

        // 3️⃣ Phân trang
        if (limit == null || limit <= 0) limit = 10; // mặc định 10 sản phẩm
        if (page == null || page <= 0) page = 1;

        int start = (page - 1) * limit;
        int end = Math.min(start + limit, medicines.size());
        if (start >= medicines.size()) {
            medicines = List.of(); // hết sản phẩm
        } else {
            medicines = medicines.subList(start, end);
        }

        // 4️⃣ Map sang DTO
        return medicines.stream()
                .map(m -> new MedicineListDto(
                        m.getId(),
                        m.getName(),
                        m.getBrand(),
                        m.getPrice(),
                        m.getImageUrl()
                ))
                .collect(Collectors.toList());
    }


    // ============= MEDICINE DETAIL =============
    public Optional<MedicineDetailDto> getMedicineDetail(Integer id) {
        return medicineRepository.findById(id)
                .map(m -> new MedicineDetailDto(
                        m.getId(),
                        m.getName(),
                        m.getBrand(),
                        m.getDescription(),
                        m.getIngredient(),
                        m.getRegistrationNum(),
                        m.getDosageForm(),
                        m.getCountry(),
                        m.getOrigin(),
                        m.getPackageInfo(),
                        m.getManufacturer(),
                        m.getPrice(),
                        m.getImageUrl(),
                        m.getUsageText(),
                        m.getCategoryId()
                ));
    }
}