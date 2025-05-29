package com.example.backend.domain.chat.chatroom.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class OpponentResponseDto {
    private String name;
    private String department;

}
