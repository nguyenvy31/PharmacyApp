package vn.edu.hcmuaf.fit.pharmacityappbe.promotion.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.dto.PromotionDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.dto.PromotionRequest;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.dto.PromotionValidateResponse;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.entity.Promotion;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.entity.PromotionType;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.repository.PromotionRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    public PromotionValidateResponse validate(String code, long orderAmount) {

        Promotion promo = promotionRepository
                .findByCodeAndActiveTrue(code)
                .orElse(null);

        if (promo == null) {
            return invalid("Mã khuyến mãi không tồn tại");
        }

        if (promo.getExpireAt() != null &&
                promo.getExpireAt().isBefore(LocalDateTime.now())) {
            return invalid("Mã đã hết hạn");
        }

        if (promo.getUsed() >= promo.getQuantity()) {
            return invalid("Mã đã hết lượt sử dụng");
        }

        if (orderAmount < promo.getMinOrderValue()) {
            return invalid("Đơn hàng chưa đạt giá trị tối thiểu");
        }

        long discount = calculateDiscount(promo, orderAmount);

        return PromotionValidateResponse.builder()
                .valid(true)
                .discount(discount)
                .promotionId(promo.getId())
                .build();
    }

    private long calculateDiscount(Promotion promo, long orderAmount) {
        long discount;

        if (promo.getType() == PromotionType.FIXED) {
            discount = promo.getValue();
        } else {
            discount = orderAmount * promo.getValue() / 100;
        }

        if (promo.getMaxDiscount() != null) {
            discount = Math.min(discount, promo.getMaxDiscount());
        }

        return Math.min(discount, orderAmount);
    }

    private PromotionValidateResponse invalid(String msg) {
        return PromotionValidateResponse.builder()
                .valid(false)
                .message(msg)
                .build();
    }

    /* =================== ADMIN =================== */

    public List<PromotionDto> getAll() {
        return promotionRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public PromotionDto getById(Long id) {
        Promotion p = promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found"));
        return toDto(p);
    }

    public PromotionDto create(PromotionRequest req) {
        if (promotionRepository.existsByCodeIgnoreCase(req.getCode())) {
            throw new IllegalArgumentException("Promo code already exists");
        }

        Promotion p = new Promotion();
        p.setCode(req.getCode().toUpperCase());
        p.setType(req.getType());
        p.setValue(req.getValue());
        p.setMinOrderValue(req.getMinOrderValue());
        p.setMaxDiscount(req.getMaxDiscount());
        p.setQuantity(req.getQuantity());
        p.setUsed(0);
        p.setExpireAt(req.getExpireAt());
        p.setActive(req.isActive());
        p.setCreatedAt(LocalDateTime.now());

        return toDto(promotionRepository.save(p));
    }

    public PromotionDto update(Long id, PromotionRequest req) {
        Promotion p = promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found"));

        if (!p.getCode().equalsIgnoreCase(req.getCode())) {
            if (promotionRepository.existsByCodeIgnoreCase(req.getCode())) {
                throw new IllegalArgumentException("Promo code already exists");
            }
            p.setCode(req.getCode().toUpperCase());
        }

        p.setType(req.getType());
        p.setValue(req.getValue());
        p.setMinOrderValue(req.getMinOrderValue());
        p.setMaxDiscount(req.getMaxDiscount());
        p.setQuantity(req.getQuantity());
        p.setExpireAt(req.getExpireAt());
        p.setActive(req.isActive());

        return toDto(p);
    }

    public void toggleActive(Long id) {
        Promotion p = promotionRepository.findById(id)
                .orElseThrow();
        p.setActive(!p.isActive());
    }

    public void delete(Long id) {
        promotionRepository.deleteById(id);
    }

    /* =================== MAPPING =================== */

    private PromotionDto toDto(Promotion p) {
        return new PromotionDto(
                p.getId(),
                p.getCode(),
                p.getType(),
                p.getValue(),
                p.getMinOrderValue(),
                p.getMaxDiscount(),
                p.getQuantity(),
                p.getUsed(),
                p.isActive(),
                p.getExpireAt(),
                p.getCreatedAt()
        );
    }
}

