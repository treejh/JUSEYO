package com.example.backend.supplyReturn.entity;

import com.example.backend.auditable.Auditable;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.item.entity.Item;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.supplyRequest.entity.SupplyRequest;
import com.example.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "supply_return")
public class SupplyReturn extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "request_id", nullable = false)
    private SupplyRequest supplyRequest;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // 유저 엔티티가 필요함

    @ManyToOne
    @JoinColumn(name = "management_id", nullable = false)
    private ManagementDashboard managementDashboard;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "serial_number", length = 30)
    private String serialNumber;

    @Column(name = "product_name", length = 30, nullable = false)
    private String productName;

    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @Column(name = "use_date", nullable = false)
    private LocalDateTime useDate;

    @Column(name = "return_date", nullable = false)
    private LocalDateTime returnDate;


    @Column(name = "approval_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus;


}
