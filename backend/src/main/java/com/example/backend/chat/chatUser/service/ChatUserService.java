package com.example.backend.chat.chatUser.service;


import com.example.backend.chat.chatUser.repository.ChatUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatUserService {
    private final ChatUserRepository chatUserRepository;

}
