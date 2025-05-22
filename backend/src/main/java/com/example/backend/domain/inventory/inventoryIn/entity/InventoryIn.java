package com.example.backend.domain.inventory.inventoryIn.entity;

import com.example.backend.global.auditable.Auditable;
import com.example.backend.domain.category.entity.Category;
import com.example.backend.enums.Inbound;
import com.example.backend.domain.item.entity.Item;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.domain.registerItem.entity.RegisterItem;
import com.example.backend.domain.supply.supplyReturn.entity.SupplyReturn;
import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "inventory_ins")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
public class InventoryIn extends Auditable {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "return_id", nullable = true)
    private SupplyReturn supplyReturn;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "management_id", nullable = false)
    private ManagementDashboard managementDashboard;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    @Enumerated(EnumType.STRING)
    @Column(name = "inbound_type", nullable = false)
    private Inbound inbound; //입고 유형

    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @ManyToOne
    @JoinColumn(name = "register_item_id", nullable = true)
    private RegisterItem registerItem;

    @Column(name = "image")
    private String image;

}
