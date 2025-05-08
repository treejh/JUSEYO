package com.example.backend.inventoryIn.entity;

import com.example.backend.auditable.Auditable;
import com.example.backend.enums.Inbound;
import com.example.backend.enums.Outbound;
import com.example.backend.item.entity.Item;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
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
    private String id;

    @Column(name = "quantity", nullable = false)
    private Long quantity;


    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;


    @Enumerated(EnumType.STRING)
    @Column(name = "outbound_type", nullable = false)
    private Inbound inbound; //입고 유형







}
