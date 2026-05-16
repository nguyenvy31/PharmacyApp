package vn.edu.hcmuaf.fit.pharmacityappbe.promotion.controller;

import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.dto.PromotionDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.dto.PromotionRequest;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.service.PromotionService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/promotions")
public class PromotionAdminController {

    private final PromotionService promotionService;

    public PromotionAdminController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping
    public List<PromotionDto> getAll() {
        return promotionService.getAll();
    }

    @GetMapping("/{id}")
    public PromotionDto get(@PathVariable Long id) {
        return promotionService.getById(id);
    }

    @PostMapping
    public PromotionDto create(@RequestBody PromotionRequest req) {
        return promotionService.create(req);
    }

    @PutMapping("/{id}")
    public PromotionDto update(@PathVariable Long id,
                               @RequestBody PromotionRequest req) {
        return promotionService.update(id, req);
    }

    @PatchMapping("/{id}/toggle")
    public void toggle(@PathVariable Long id) {
        promotionService.toggleActive(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        promotionService.delete(id);
    }
}
