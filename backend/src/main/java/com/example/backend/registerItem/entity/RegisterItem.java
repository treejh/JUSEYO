package com.example.backend.registerItem.entity;

import com.example.backend.category.entity.Category;
import com.example.backend.enums.Inbound;
import com.example.backend.item.entity.Item;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "register_item")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
public class RegisterItem {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "management_id", nullable = false)
    private ManagementDashboard managementDashboard;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "image")
    private String image;

    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @Column(name = "purchase_date", nullable = false)
    private LocalDateTime purchaseDate;  //구매일

    @Column(name = "purchase_source")
    private String purchaseSource; //구매처

    @Column(name = "location")
    private String location; //비치 위치

    @Enumerated(EnumType.STRING)
    @Column(name = "inbound_type", nullable = false)
    private Inbound inbound; //구매 상태
}
