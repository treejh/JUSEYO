package com.example.backend.domain.department.dto.response;


import com.example.backend.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponseDTO {
    Long id;
    String username;
    String departmentName;

    public UserResponseDTO(User user){
        this.id = user.getId();
        this.username = user.getName();
        this.departmentName = user.getDepartment().getName();
    }
}
