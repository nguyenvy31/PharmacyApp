package vn.edu.hcmuaf.fit.pharmacityappbe.shop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "medicine")
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    private String brand;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text")
    private String ingredient;

    @Column(name = "registration_num")
    private String registrationNum;

    @Column(name = "dosage_form")
    private String dosageForm;

    private String country;

    private String origin;

    @Column(name = "package_info")
    private String packageInfo;

    private String manufacturer;

    private Long price;

    @Column(name = "image_url", columnDefinition = "text")
    private String imageUrl;

    @Column(name = "local_image_path")
    private String localImagePath;

    @Column(name = "usage_text", columnDefinition = "text")
    private String usageText;

    @Column(name = "category_id")
    private Integer categoryId;
}

