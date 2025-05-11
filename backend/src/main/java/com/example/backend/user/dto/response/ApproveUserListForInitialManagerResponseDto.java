package com.example.backend.user.dto.response;


import com.example.backend.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ApproveUserListForInitialManagerResponseDto {

    String name;

    String email;

    String phoneNumber;

    public ApproveUserListForInitialManagerResponseDto(User user){
        this.name = user.getName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
    }

}
