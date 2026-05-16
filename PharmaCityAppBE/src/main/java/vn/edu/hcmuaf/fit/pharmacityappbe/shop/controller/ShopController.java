package vn.edu.hcmuaf.fit.pharmacityappbe.shop.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.dto.CategoryDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.dto.MedicineDetailDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.dto.MedicineListDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.service.ShopService;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@Tag(name = "Shop", description = "RESTful API cho danh mục và thuốc")
public class ShopController {

    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    // -------- CATEGORY ----------
    @Operation(summary = "Danh sách tất cả category")
    @GetMapping("/categories")
    public List<CategoryDto> getCategories() {
        return shopService.getAllCategories();
    }

    // -------- MEDICINE LIST ----------
    @Operation(summary = "Danh sách thuốc (lọc theo category / search / sort / limit / page)")
    @GetMapping("/medicines")
    public List<MedicineListDto> getMedicines(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "popular") String sort,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false, defaultValue = "1") Integer page
    ) {
        return shopService.getMedicines(categoryId, search, sort, limit, page);
    }

    // -------- MEDICINE DETAIL ----------
    @Operation(summary = "Chi tiết 1 thuốc theo ID")
    @GetMapping("/medicines/{id}")
    public ResponseEntity<MedicineDetailDto> getMedicineDetail(@PathVariable Integer id) {
        return shopService.getMedicineDetail(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}