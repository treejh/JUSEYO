package com.example.backend.domain.user.dto.response;


import com.example.backend.domain.user.entity.User;
import com.example.backend.enums.ApprovalStatus;
import java.time.LocalDateTime;
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

    LocalDateTime requestDate;

    ApprovalStatus approvalStatus;



    public ApproveUserListForInitialManagerResponseDto(User user){
        this.userId=user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.requestDate = user.getCreatedAt();
        this.approvalStatus=user.getApprovalStatus();
    }

}
