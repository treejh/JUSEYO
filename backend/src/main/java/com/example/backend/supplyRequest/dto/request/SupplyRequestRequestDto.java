package com.example.backend.supplyRequest.dto.request;

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
    @NotBlank
    private String productName;    // 입력한 “품목명”으로 아이템 조회

    @NotNull
    private Long quantity;

    @NotBlank
    private String purpose;

    @NotNull
    private Boolean rental;        // 대여 여부

    private LocalDateTime useDate;     // rental=true일 때만 클라이언트 전달, 빌리지 않은경우에는 요청한 날로 자동설정
    private LocalDateTime returnDate;  // rental=true일 때만 클라이언트 전달

    public boolean isRental() {
        return Boolean.TRUE.equals(this.rental);
    }
}