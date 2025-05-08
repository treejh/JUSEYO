package com.example.backend.itemInstance.entity;

import com.example.backend.auditable.Auditable;
import com.example.backend.category.entity.Category;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.Outbound;
import com.example.backend.item.entity.Item;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
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
@Table(name = "item_instances")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
public class ItemInstance extends Auditable {

    @Id
    @Column(name = "id")
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "outbound_type", nullable = false)
    private Outbound outboundout; // 승인 상태


    @Column(name = "image", nullable = false)
    private String image; //비품 이미지

    @Column(name = "fina_image", nullable = false)
    private String finalImage; //비품 이미지

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;





}
