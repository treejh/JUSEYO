package com.example.backend.domain.itemInstance.entity;

import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import com.example.backend.domain.user.entity.User;
import com.example.backend.global.auditable.Auditable;
import com.example.backend.domain.item.entity.Item;
import com.example.backend.enums.Outbound;
import com.example.backend.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "item_instances")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
public class ItemInstance extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "outbound", nullable = false, length = 20)
    private Outbound outbound; // 현재상태

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrower_user_id", nullable = false)
    private User borrower;

    @Column(name = "image", nullable = false)
    private String image; //비품 이미지

    @Column(name = "final_image",nullable = true)
    private String finalImage; //비품 최종 이미지

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    // 예: PEN(비품명)-001-a1b2c3d4
    @Column(name = "instance_code", nullable = false, length = 50, unique = true)
    private String instanceCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20, columnDefinition = "VARCHAR(20)")
    private Status status=Status.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supply_request_id")
    private SupplyRequest supplyRequest;
}
