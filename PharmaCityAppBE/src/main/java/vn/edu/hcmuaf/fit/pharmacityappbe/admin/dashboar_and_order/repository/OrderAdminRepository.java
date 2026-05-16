package vn.edu.hcmuaf.fit.pharmacityappbe.admin.dashboar_and_order.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.entity.Order;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderAdminRepository extends JpaRepository<Order, Integer> {

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE DATE(o.createdAt) = CURRENT_DATE")
    Integer sumRevenueToday();

    @Query("SELECT COUNT(o) FROM Order o WHERE DATE(o.createdAt) = CURRENT_DATE")
    Integer countOrdersToday();

    List<Order> findTop5ByOrderByCreatedAtDesc();

    @Query("""
            SELECT o 
            FROM Order o 
            WHERE (:status IS NULL OR o.status = :status)
              AND (:search IS NULL
                   OR LOWER(o.receiverName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(o.receiverPhone) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    List<Order> search(@Param("status") String status, @Param("search") String search);

    @Query("""
    SELECT FUNCTION('DATE', o.createdAt),
           COALESCE(SUM(o.totalAmount), 0.0)
    FROM Order o
    WHERE o.createdAt >= :fromDate
    GROUP BY FUNCTION('DATE', o.createdAt)
    """)
    List<Object[]> getRevenueLast7DaysRaw(
            @Param("fromDate") LocalDateTime fromDate
    );

    // OrderAdminRepository.java
    @Query("SELECT SUM(o.totalAmount) FROM Order o")
    Long sumTotalRevenue();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE MONTH(o.createdAt) = MONTH(CURRENT_DATE) AND YEAR(o.createdAt) = YEAR(CURRENT_DATE)")
    Long sumRevenueThisMonth();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE MONTH(o.createdAt) = MONTH(CURRENT_DATE - 1 MONTH) AND YEAR(o.createdAt) = YEAR(CURRENT_DATE - 1 MONTH)")
    Long sumRevenueLastMonth();

}
