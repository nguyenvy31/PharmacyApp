package vn.edu.hcmuaf.fit.pharmacityappbe.review.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Integer userId;
    private Integer medicineId;
    private int rating;
    private String comment;
    private String imageUrl;
}