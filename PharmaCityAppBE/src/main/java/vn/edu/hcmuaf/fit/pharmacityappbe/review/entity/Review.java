package vn.edu.hcmuaf.fit.pharmacityappbe.review.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.entity.User;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.entity.Medicine;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private int rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    private String imageUrl;

    private LocalDateTime createdAt = LocalDateTime.now();
}