package com.example.backend.domain.supply.supplyRequest.entity;

import com.example.backend.global.auditable.Auditable;
import com.example.backend.domain.user.entity.User;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.domain.item.entity.Item;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "supply_request")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
public class SupplyRequest extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "management_id", nullable = false)
    private ManagementDashboard managementDashboard;

    @Column(name = "serial_number")
    private String serialNumber;

    @Column(name = "field")
    private Boolean reRequest;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "quantity", nullable = false)
    private Long quantity; //비품 수량

    @Column(name = "purpose", nullable = false)
    private String purpose; //사용 목적

    @Column(name = "use_date")
    private LocalDateTime useDate;  //사용 날짜

    @Column(name = "return_date")
    private LocalDateTime returnDate;  //반납 날짜

    @Column(name = "rental", nullable = false)
    private boolean rental; //대여 사용 여부

    @Enumerated(EnumType.STRING)
    @Column(name = "outbound_type", nullable = false)
    private ApprovalStatus approvalStatus; // 승인 상태

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

}
