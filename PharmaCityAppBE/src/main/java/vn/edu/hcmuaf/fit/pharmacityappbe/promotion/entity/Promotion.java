package vn.edu.hcmuaf.fit.pharmacityappbe.promotion.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "promotions")
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    private PromotionType type; // FIXED, PERCENT

    private int value;

    private int minOrderValue;

    private Integer maxDiscount;

    private int quantity;
    private int used;

    private LocalDateTime expireAt;
    private boolean active;
    private LocalDateTime createdAt;
}

