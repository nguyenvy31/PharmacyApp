package vn.edu.hcmuaf.fit.pharmacityappbe.promotion.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.dto.PromotionValidateRequest;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.service.PromotionService;

@RestController
@RequestMapping("/api/v1/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @PostMapping("/validate")
    public ResponseEntity<?> validate(@RequestBody PromotionValidateRequest req) {
        return ResponseEntity.ok(
                promotionService.validate(req.getCode(), req.getOrderAmount())
        );
    }
}

