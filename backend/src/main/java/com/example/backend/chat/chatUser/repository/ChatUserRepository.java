package com.example.backend.chat.chatUser.repository;

import com.example.backend.chat.chatUser.entity.ChatUser;
import com.example.backend.chat.chatroom.entity.ChatRoom;
import com.example.backend.user.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ChatUserRepository extends JpaRepository<ChatUser, Long> {

    Optional<ChatUser> findByUserAndChatRoom(User user, ChatRoom chatRoom);
    Optional<ChatUser> findByChatRoom(ChatRoom chatRoom);
}
