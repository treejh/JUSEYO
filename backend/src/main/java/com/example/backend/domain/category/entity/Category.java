package com.example.backend.domain.category.entity;

import com.example.backend.global.auditable.Auditable;
import com.example.backend.domain.item.entity.Item;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "categories")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
public class Category extends Auditable {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // PK

    @Column(name = "name", nullable = false)
    private String name; // 카테고리 이름

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "management_id")
    private ManagementDashboard managementDashboard; // 관리 페이지 - 대시보드 매핑

    @OneToMany(mappedBy = "category", cascade = CascadeType.REMOVE, orphanRemoval = false)
    @ToString.Exclude
    List<Item> itemList = new ArrayList<>(); //해당 카테고리에 속한 아이템 리스트


}
