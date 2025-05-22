package com.example.backend.domain.user.dto.response;


import com.example.backend.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ApproveUserListForManagerResponseDto {

    Long userId;

    String name;

    String email;

    String maskedPhoneNumber;

    public ApproveUserListForManagerResponseDto(User user) {
        this.userId = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.maskedPhoneNumber = maskPhoneNumber(user.getPhoneNumber());
    }

    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null) return null;

        // 하이픈이 있는 형식: 010-1234-5678 -> 010-****-5678
        if (phoneNumber.matches("\\d{3}-\\d{3,4}-\\d{4}")) {
            return phoneNumber.replaceAll("(\\d{3}-)\\d{3,4}(-\\d{4})", "$1****$2");
        }

        // 하이픈 없는 형식: 01012345678 -> 010****5678
        //하이픈 형식으로 저장되긴 하지만, 만약을 대비해서 넣은 코드
        return phoneNumber.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2");
    }



}
