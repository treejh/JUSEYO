package com.example.backend.domain.supply.supplyReturn.entity;

import com.example.backend.global.auditable.Auditable;
import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import com.example.backend.domain.user.entity.User;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.Outbound;
import com.example.backend.domain.item.entity.Item;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "outbound", nullable = false, length = 20)
    private Outbound outbound; // 현재 상태(사용가능,파손)


}
