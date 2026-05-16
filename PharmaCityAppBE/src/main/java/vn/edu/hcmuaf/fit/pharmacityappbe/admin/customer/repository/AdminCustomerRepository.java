package vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.dto.AdminCustomerDetailDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.dto.AdminCustomerListDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.entity.User;

import java.util.List;

public interface AdminCustomerRepository extends JpaRepository<User, Integer> {

    @Query("""
    SELECT new vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.dto.AdminCustomerListDto(
        u.id,
        u.name,
        u.phone,
        COUNT(o.id),
        COALESCE(SUM(o.totalAmount), 0),
        u.createdAt
    )
    FROM User u
    LEFT JOIN Order o ON o.user = u
    GROUP BY u.id, u.name, u.phone, u.createdAt
    ORDER BY u.createdAt DESC
""")
    List<AdminCustomerListDto> findAllCustomersForAdmin();

    @Query("""
    SELECT new vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.dto.AdminCustomerDetailDto(
        u.id,
        u.name,
        u.phone,
        u.email,
        u.verified,
        COUNT(o.id),
        COALESCE(SUM(o.totalAmount), 0),
        u.createdAt
    )
    FROM User u
    LEFT JOIN Order o ON o.user = u
    WHERE u.id = :id
    GROUP BY u.id, u.name, u.phone, u.email, u.verified, u.createdAt
""")
    AdminCustomerDetailDto findCustomerDetail(Integer id);



}
