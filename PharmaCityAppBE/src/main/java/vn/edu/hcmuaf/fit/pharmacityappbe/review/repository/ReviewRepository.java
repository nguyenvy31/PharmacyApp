package vn.edu.hcmuaf.fit.pharmacityappbe.review.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.pharmacityappbe.review.entity.Review;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    List<Review> findByMedicineIdOrderByCreatedAtDesc(Integer medicineId);

    boolean existsByMedicineIdAndUserId(Integer medicineId, Integer userId);

    @Query("""
        SELECT AVG(r.rating) FROM Review r
        WHERE r.medicine.id = :medicineId
    """)
    Double getAverageRating(Integer medicineId);

    @Query("""
        SELECT COUNT(r) FROM Review r
        WHERE r.medicine.id = :medicineId
    """)
    Long countReviews(Integer medicineId);
}
