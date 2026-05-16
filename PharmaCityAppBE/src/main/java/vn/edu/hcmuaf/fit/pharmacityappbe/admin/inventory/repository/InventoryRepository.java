package vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.dto.InventoryItemDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.entity.Inventory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Integer> {

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.stock < :threshold")
    Integer countLowStock(@Param("threshold") int threshold);

    // Dashboard / Inventory list
    @Query("""
            SELECT new vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.dto.InventoryItemDto(
                m.id,
                m.name,
                i.stock,
                COALESCE(SUM(
                    CASE
                        WHEN FUNCTION('date', o.createdAt) = :today
                        THEN oi.quantity
                        ELSE 0
                    END
                ), 0),
                COALESCE(SUM(
                    CASE
                        WHEN o.createdAt >= :sevenDaysAgo
                        THEN oi.quantity
                        ELSE 0
                    END
                ), 0)
            )
            FROM Inventory i
            JOIN i.medicine m
            LEFT JOIN OrderItem oi ON oi.medicine.id = m.id
            LEFT JOIN oi.order o
            GROUP BY m.id, m.name, i.stock
            """)
    List<InventoryItemDto> getInventory(
            @Param("today") LocalDate today,
            @Param("sevenDaysAgo") LocalDateTime sevenDaysAgo
    );


    // Cập nhật tồn kho
    @Modifying
    @Query("""
    UPDATE Inventory i 
    SET i.stock = i.stock + :qty 
    WHERE i.medicine.id = :medicineId
    """)
    void addStock(@Param("medicineId") Integer medicineId,
                  @Param("qty") Integer qty);


    Optional<Inventory> findByMedicineId(Integer medicineId);
}