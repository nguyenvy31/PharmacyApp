package vn.edu.hcmuaf.fit.pharmacityappbe.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.entity.User;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.entity.Order;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByUserOrderByCreatedAtDesc(User user);

    @Query("""
    SELECT COUNT(oi)
    FROM OrderItem oi
    WHERE oi.order.user.id = :userId
    AND oi.medicine.id = :medicineId
    AND oi.order.status = 'COMPLETED'
""")
    Long hasPurchased(int userId, int medicineId);
}
