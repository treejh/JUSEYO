package com.example.backend.chat.chatUser.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ChatUserRepository extends JpaRepository<ChatUserRepository, Long> {
}
