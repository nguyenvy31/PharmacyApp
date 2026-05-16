package vn.edu.hcmuaf.fit.pharmacityappbe.review.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.entity.User;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.repository.UserRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.chatbox.service.ChatService;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.repository.OrderRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.review.dto.ReviewResponse;
import vn.edu.hcmuaf.fit.pharmacityappbe.review.entity.Review;
import vn.edu.hcmuaf.fit.pharmacityappbe.review.repository.ReviewRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.entity.Medicine;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.repository.MedicineRepository;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ChatService chatService;

    private User getUserOrThrow(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public void createReview(Integer userId,
                               Integer medicineId,
                               int rating,
                               String comment,
                               String imageUrl) {

        if (reviewRepository.existsByMedicineIdAndUserId(medicineId, userId)) {
            throw new RuntimeException("Bạn đã đánh giá rồi");
        }

        if (orderRepository.hasPurchased(userId, medicineId) == 0) {
            throw new RuntimeException("Bạn chưa mua sản phẩm này");
        }

        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating phải từ 1 đến 5");
        }



        if (comment != null && !comment.trim().isEmpty()) {
            String aiResult = checkReviewWithAI(rating, comment);

            if ("WARNING".equals(aiResult)) {
                throw new RuntimeException("Nội dung và số sao không khớp. Vui lòng đánh giá lại!");
            }
        }

        User user = getUserOrThrow(userId);

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found"));

        Review review = new Review();
        review.setMedicine(medicine);
        review.setUser(user);
        review.setRating(rating);
        review.setComment(comment);

        if (imageUrl != null && !imageUrl.isEmpty()) {
            if (!isValidImageUrl(imageUrl)) {
                throw new RuntimeException("URL ảnh không hợp lệ");
            }
            review.setImageUrl(imageUrl);
        }

        reviewRepository.save(review);
    }
    public List<ReviewResponse> getReviewsByMedicine(Integer medicineId) {

        return reviewRepository
                .findByMedicineIdOrderByCreatedAtDesc(medicineId)
                .stream()
                .map(r -> new ReviewResponse(
                        r.getId(),
                        r.getUser().getId(),
                        r.getRating(),
                        r.getComment(),
                        r.getImageUrl(),
                        r.getUser().getName(),
                        r.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());
    }

    public void deleteReview(Integer reviewId, Integer userId) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));

        if (!Objects.equals(review.getUser().getId(), userId)) {
            throw new RuntimeException("Bạn không có quyền xoá đánh giá này");
        }

        reviewRepository.delete(review);
    }

    private String checkReviewWithAI(int rating, String comment) {
        if (comment == null || comment.trim().isEmpty()) return "OK";

        String prompt = """
    Bạn là hệ thống kiểm duyệt đánh giá sản phẩm.
    Rating: %d/5 sao
    Nội dung: "%s"
    
    Phân tích: Nội dung có phù hợp với số sao không?
    - Nếu nội dung tích cực mà rating thấp (1-2) → WARNING
    - Nếu nội dung tiêu cực mà rating cao (4-5) → WARNING
    - Các trường hợp khác → OK
    
    Trả lời DUY NHẤT "OK" hoặc "WARNING", không giải thích.
    """.formatted(rating, comment);

        try {
            System.out.println("=== AI REVIEW CHECK ===");
            System.out.println("Rating: " + rating);
            System.out.println("Comment: " + comment);

            String result = chatService.callChatAPI(prompt, "openrouter");

            // Hoặc dùng openrouter trực tiếp:
            // String result = chatService.callChatAPI(prompt, "openrouter");

            System.out.println("Raw AI Result: '" + result + "'");

            if (result == null) {
                System.out.println("AI result is NULL");
                return "WARNING";
            }

            result = result.trim().toUpperCase();
            System.out.println("Processed Result: '" + result + "'");

            if (result.equals("OK")) {
                System.out.println("→ Returning OK");
                return "OK";
            }

            System.out.println("→ Returning WARNING (result not OK)");
            return "WARNING";

        } catch (Exception e) {
            System.err.println("AI Check EXCEPTION: " + e.getMessage());
            e.printStackTrace();
            return "WARNING";
        }
    }
    private boolean isValidImageUrl(String url) {
        return url != null && (url.startsWith("http://") || url.startsWith("https://"));
    }
}