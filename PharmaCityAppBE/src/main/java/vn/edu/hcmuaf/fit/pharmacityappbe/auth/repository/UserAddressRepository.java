package vn.edu.hcmuaf.fit.pharmacityappbe.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.entity.User;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.entity.UserAddress;

import java.util.List;

public interface UserAddressRepository extends JpaRepository<UserAddress, Integer> {

    List<UserAddress> findByUserOrderByIsDefaultDescIdDesc(User user);

    void deleteByUserAndId(User user, Integer id);
}