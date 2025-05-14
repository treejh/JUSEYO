package com.example.backend.chat.chatUser.repository;

import com.example.backend.chat.chatUser.entity.ChatUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ChatUserRepository extends JpaRepository<ChatUser, Long> {
}
