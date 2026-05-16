package vn.edu.hcmuaf.fit.pharmacityappbe.promotion.dto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class PromotionValidateResponse {
    private boolean valid;
    private long discount;
    private String message;
    private Long promotionId;
}

