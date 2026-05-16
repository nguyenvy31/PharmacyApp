package vn.edu.hcmuaf.fit.pharmacityappbe.cart.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.entity.User;
import vn.edu.hcmuaf.fit.pharmacityappbe.cart.entity.CartItem;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.entity.Medicine;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {

    List<CartItem> findByUserOrderByIdDesc(User user);

    Optional<CartItem> findByUserAndMedicine(User user, Medicine medicine);

    void deleteByUserAndMedicine(User user, Medicine medicine);

    void deleteByUser(User user);

    void deleteByUserAndMedicineId(User user, Integer medicineId);
}
