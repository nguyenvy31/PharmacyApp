package vn.edu.hcmuaf.fit.pharmacityappbe.review.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReviewResponse {

    private Integer id;
    private Integer userId;
    private int rating;
    private String comment;
    private String imageUrl;
    private String userName;
    private String createdAt;
}