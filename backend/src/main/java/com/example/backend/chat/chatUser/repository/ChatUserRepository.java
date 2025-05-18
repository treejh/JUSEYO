package com.example.backend.chat.chatUser.repository;

import com.example.backend.chat.chatUser.entity.ChatUser;
import com.example.backend.chat.chatroom.entity.ChatRoom;
import com.example.backend.enums.ChatRoomType;
import com.example.backend.enums.ChatStatus;
import com.example.backend.user.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ChatUserRepository extends JpaRepository<ChatUser, Long> {

    Optional<ChatUser> findByUserAndChatRoom(User user, ChatRoom chatRoom);
    List<ChatUser> findByChatRoom(ChatRoom chatRoom);
    void deleteById(Long id);

    List<ChatUser> findByUser(User user);


    // ChatStatus : ENTER, LEAVE, CREATE
    Page<ChatUser> findByUserAndChatRoomRoomTypeAndChatStatusIn(
            User user,
            ChatRoomType roomType,
            List<ChatStatus> statuses,
            Pageable pageable
    );

}
