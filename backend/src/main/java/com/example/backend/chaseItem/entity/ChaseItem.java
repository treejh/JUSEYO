package com.example.backend.chaseItem.entity;

import com.example.backend.auditable.Auditable;
import com.example.backend.supplyRequest.entity.SupplyRequest;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chase_item")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChaseItem extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private SupplyRequest supplyRequest;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @Column(name = "issue", length = 100)
    private String issue;
}