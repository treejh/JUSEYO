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
public class UserListResponseDto {

    Long id;

    String name;

    String department;

    public UserListResponseDto(User user){
        this.id= user.getId();
        this.name = user.getName();
        this.department  = user.getDepartment().getName();
    }
}
