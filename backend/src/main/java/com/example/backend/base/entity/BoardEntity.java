package com.example.backend.base.entity;


import com.example.backend.auditable.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;


@Entity
@Table(name = "board")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class BoardEntity extends Auditable {
    @Id
    @Column
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long projectId;

    @Column
    private long memberId;

    @Column(nullable = false)
    @Min(value = 1)
    @Max(value =10 )
    private int recruitmentSize;

    @Column(length = 40 ,nullable = false)
    private String title;

    @Column(length = 100 ,nullable = false)
    private String boardContent;

    @Column(length = 100 ,nullable = false)
    private String boardGoal;

    @Column(length = 100 ,nullable = false)
    private String boardPartner;

    @Column(nullable = false)
    private LocalDate recruitmentPeriod;

    @Column(nullable = false)
    private LocalDate expectedDuration;

}