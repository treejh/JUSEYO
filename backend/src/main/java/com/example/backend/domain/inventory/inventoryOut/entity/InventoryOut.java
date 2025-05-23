package com.example.backend.domain.inventory.inventoryOut.entity;

import com.example.backend.global.auditable.Auditable;
import com.example.backend.domain.category.entity.Category;
import com.example.backend.enums.Outbound;
import com.example.backend.domain.item.entity.Item;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "inventory_outs")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
public class InventoryOut extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suuply_id", nullable = false)
    private SupplyRequest supplyRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "management_id", nullable = false)
    private ManagementDashboard managementDashboard;

    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Enumerated(EnumType.STRING)
    @Column(name = "outbound_type", nullable = false)
    private Outbound outbound; //출고 유형


}
