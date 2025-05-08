package com.example.backend.item.entity;

import com.example.backend.auditable.Auditable;
import com.example.backend.category.entity.Category;
import com.example.backend.enums.Inbound;
import com.example.backend.inventoryIn.entity.InventoryIn;
import com.example.backend.inventoryOut.entity.InventoryOut;
import com.example.backend.itemInstance.entity.ItemInstance;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.supplyRequest.entity.SupplyRequest;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "items")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
public class Item extends Auditable {

    @Id
    @Column(name = "id")
    private String id;


    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "serial_number", nullable = false)
    private String serialNumber;

    @Column(name = "total_quantity", nullable = false)
    private Long totalQuantity;

    @Column(name = "available_quantity", nullable = false)
    private Long availableQuantity; //현재 재고

    @Column(name = "purchase_date")
    private LocalDateTime purchaseDate;  //구매일

    @Column(name = "purchase_source")
    private String purchaseSource; //구매처

    @Column(name = "location")
    private String location; //비치 위치

    @Column(name = "is_return_required", nullable = false)
    private Boolean isReturnRequired; //반납 필수 여부


    @ManyToOne
    @JoinColumn(name = "management_id")
    private ManagementDashboard managementDashboard;


    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;


    @OneToMany(mappedBy = "item", cascade = CascadeType.REMOVE, orphanRemoval = true,  fetch = FetchType.LAZY)
    List<ItemInstance> itemInstances = new ArrayList<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.REMOVE, orphanRemoval = true,  fetch = FetchType.LAZY)
    List<InventoryIn> inventoryInList = new ArrayList<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.REMOVE, orphanRemoval = true,  fetch = FetchType.LAZY)
    List<InventoryOut> inventoryOutList = new ArrayList<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.REMOVE, orphanRemoval = true,  fetch = FetchType.LAZY)
    List<SupplyRequest> supplyRequestList = new ArrayList<>();









}
