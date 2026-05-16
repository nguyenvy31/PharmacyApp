package vn.edu.hcmuaf.fit.pharmacityappbe.review.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hcmuaf.fit.pharmacityappbe.review.dto.ReviewRequest;
import vn.edu.hcmuaf.fit.pharmacityappbe.review.dto.ReviewResponse;
import vn.edu.hcmuaf.fit.pharmacityappbe.review.entity.Review;
import vn.edu.hcmuaf.fit.pharmacityappbe.review.repository.ReviewRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.review.service.ReviewService;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewRepository reviewRepository;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ReviewRequest req) {
        try {
            // Service là void, không trả về gì cả
            reviewService.createReview(
                    req.getUserId(),
                    req.getMedicineId(),
                    req.getRating(),
                    req.getComment(),
                    req.getImageUrl()
            );

            // Luôn trả về success message
            Map<String, Object> res = new HashMap<>();
            res.put("message", "Đánh giá thành công");

            return ResponseEntity.ok(res);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi server"));
        }
    }

    @GetMapping("/medicine/{id}")
    public List<ReviewResponse> getByMedicine(@PathVariable Integer id) {
        return reviewService.getReviewsByMedicine(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Integer id,
            @RequestParam Integer userId
    ) {
        try {
            reviewService.deleteReview(id, userId);
            return ResponseEntity.ok(Map.of("message", "Xóa đánh giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi server"));
        }
    }

    @GetMapping("/medicine/{id}/summary")
    public Map<String, Object> summary(@PathVariable Integer id) {

        Double avg = reviewRepository.getAverageRating(id);
        Long total = reviewRepository.countReviews(id);

        return Map.of(
                "average", avg != null ? avg : 0,
                "total", total
        );
    }
}