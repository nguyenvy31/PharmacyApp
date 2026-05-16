package vn.edu.hcmuaf.fit.pharmacityappbe.admin.category.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.dto.CategoryDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.entity.Category;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.repository.CategoryRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.repository.MedicineRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;

    public List<CategoryDto> getAll() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CategoryDto create(CategoryDto dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Tên loại thuốc đã tồn tại");
        }

        Category category = new Category();
        category.setName(dto.getName());
        Category saved = categoryRepository.save(category);
        return toDto(saved);
    }

    public CategoryDto update(Integer id, CategoryDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại thuốc với ID: " + id));

        if (!category.getName().equals(dto.getName()) &&
                categoryRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Tên loại thuốc đã tồn tại");
        }

        category.setName(dto.getName());
        Category saved = categoryRepository.save(category);
        return toDto(saved);
    }

    public void delete(Integer id) {
        boolean hasMedicines = medicineRepository.existsByCategoryId(id);
        if (hasMedicines) {
            throw new RuntimeException("Không thể xóa loại thuốc này vì đang có sản phẩm thuộc loại này");
        }

        categoryRepository.deleteById(id);
    }

    private CategoryDto toDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        return dto;
    }
}