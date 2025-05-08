package com.example.backend.supplyRequest.entity;

import com.example.backend.auditable.Auditable;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.item.entity.Item;
import com.example.backend.user.entity.User;
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
@Table(name = "supply_request")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
public class SupplyRequest extends Auditable {

    @Id
    @Column(name = "id")
    private Long id;


    @Column(name = "produdct_name", nullable = false)
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
