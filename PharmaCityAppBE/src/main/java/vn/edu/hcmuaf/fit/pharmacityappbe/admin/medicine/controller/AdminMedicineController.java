package vn.edu.hcmuaf.fit.pharmacityappbe.admin.medicine.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.medicine.service.AdminMedicineService;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.medicine.dto.AdminMedicineDetailDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.medicine.dto.AdminMedicineListDto;

import java.util.List;

@RestController
@RequestMapping("/api/admin/medicines")
@RequiredArgsConstructor
public class AdminMedicineController {

    private final AdminMedicineService service;

    // 1. Danh sách thuốc (list)
    @GetMapping
    public List<AdminMedicineListDto> getAll() {
        return service.getAllForAdmin();
    }

    // 2. Chi tiết thuốc (load form sửa)
    @GetMapping("/{id}")
    public AdminMedicineDetailDto getDetail(@PathVariable Integer id) {
        return service.getDetail(id);
    }

    // 3. Tạo thuốc mới
    @PostMapping
    public AdminMedicineDetailDto create(@RequestBody AdminMedicineDetailDto dto) {
        return service.create(dto);
    }

    // 4. Cập nhật thuốc
    @PutMapping("/{id}")
    public AdminMedicineDetailDto update(
            @PathVariable Integer id,
            @RequestBody AdminMedicineDetailDto dto
    ) {
        return service.update(id, dto);
    }

    // 5. (Optional) Xóa thuốc
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}

