package com.example.backend.domain.supply.supplyRequest.dto.response;

import com.example.backend.enums.RentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "대여 물품 DTO")
public class LentItemDto {

    @Schema(description = "물품 이름", example = "노트북")
    private String itemName;

    @Schema(description = "사용 시작일시", example = "2025-05-22T10:00:00")
    private LocalDateTime useDate;

    @Schema(description = "반납 예정일시 또는 반납 일시", example = "2025-05-25T17:00:00")
    private LocalDateTime returnDate;

    @Schema(description = "대여 상태", example = "RENTING")
    private RentStatus rentStatus;

    public LentItemDto(String itemName, LocalDateTime useDate, LocalDateTime returnDate) {
        this.itemName = itemName;
        this.useDate = useDate;
        this.returnDate = returnDate;
    }

    public LentItemDto() {
    }
}
