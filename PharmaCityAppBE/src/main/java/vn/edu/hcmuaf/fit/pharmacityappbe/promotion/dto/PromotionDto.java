package vn.edu.hcmuaf.fit.pharmacityappbe.promotion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.entity.PromotionType;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PromotionDto {
    private Long id;
    private String code;
    private PromotionType type;
    private int value;
    private int minOrderValue;
    private Integer maxDiscount;
    private int quantity;
    private int used;
    private boolean active;
    private LocalDateTime expireAt;
    private LocalDateTime createdAt;
}
