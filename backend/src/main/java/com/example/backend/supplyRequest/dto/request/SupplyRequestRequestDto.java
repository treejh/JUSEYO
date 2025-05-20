package com.example.backend.supplyRequest.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class SupplyRequestRequestDto {

    @NotNull(message = "itemId는 필수 값입니다.")
    private Long itemId;

    @NotNull
    @Min(value = 1, message = "quantity는 1 이상이어야 합니다.")
    private Long quantity;

    @NotBlank(message = "purpose는 필수 값입니다.")
    private String purpose;

    @NotNull
    private Boolean rental;        // 대여 여부

    private LocalDateTime useDate;     // rental=true일 때만 클라이언트 전달, 빌리지 않은경우에는 요청한 날로 자동설정
    private LocalDateTime returnDate;  // rental=true일 때만 클라이언트 전달

    public boolean isRental() {
        return Boolean.TRUE.equals(this.rental);
    }
}