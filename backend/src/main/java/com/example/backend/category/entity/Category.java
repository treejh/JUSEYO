package com.example.backend.category.entity;

import com.example.backend.auditable.Auditable;
import com.example.backend.enums.Outbound;
import com.example.backend.item.entity.Item;
import com.example.backend.managementdashboard.entity.ManagementDashboard;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "CATEGORY")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
public class Category extends Auditable {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;


    @ManyToOne
    @JoinColumn(name = "management_id")
    private ManagementDashboard managementDashboard;


    @Enumerated(EnumType.STRING)
    @Column(name = "outbound_type", nullable = false)
    private Outbound outbound; //출고 유형


    @OneToMany(mappedBy = "category", cascade = CascadeType.REMOVE, orphanRemoval = false)
    List<Item> itemList = new ArrayList<>();




}
