package vn.edu.hcmuaf.fit.pharmacityappbe.shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.entity.Medicine;

import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Integer> {

    List<Medicine> findByCategoryId(Integer categoryId);

    @Query("""
        SELECT m FROM Medicine m
        WHERE LOWER(m.name)        LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(m.brand)       LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(m.ingredient)  LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<Medicine> searchByKeyword(@Param("keyword") String keyword);

    boolean existsByCategoryId(Integer categoryId);
}
