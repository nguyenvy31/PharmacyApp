package vn.edu.hcmuaf.fit.pharmacityappbe.promotion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.entity.Promotion;

import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByCodeAndActiveTrue(String code);
    boolean existsByCodeIgnoreCase(String code);
}

