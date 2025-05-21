package com.example.backend.domain.chat.chatroom.dto.response;

import com.example.backend.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ParticipantsResponseDto {

    Long id;
    String name;

    public ParticipantsResponseDto(User user){
        this.id = user.getId();
        this.name = user.getName();
    }

}
