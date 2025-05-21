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
public class ApproveUserListForInitialManagerResponseDto {

    Long userId;

    String name;

    String email;

    String phoneNumber;

    public ApproveUserListForInitialManagerResponseDto(User user){
        this.userId=user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
    }

}
