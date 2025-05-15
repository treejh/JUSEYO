package com.example.backend.itemInstance.entity;

import com.example.backend.auditable.Auditable;
import com.example.backend.enums.Outbound;
import com.example.backend.enums.Status;
import com.example.backend.item.entity.Item;
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
    @Column(name = "status", nullable = false, length = 20)
    private Outbound outbound; // 현재상태


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
    @Column(name = "is_item_exists")
    private Status status=Status.ACTIVE;
}
