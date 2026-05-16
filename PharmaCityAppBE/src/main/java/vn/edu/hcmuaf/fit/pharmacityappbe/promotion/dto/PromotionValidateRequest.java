package vn.edu.hcmuaf.fit.pharmacityappbe.promotion.dto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PromotionValidateRequest {
    private String code;
    private int orderAmount;
}

