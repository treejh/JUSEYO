package com.example.backend.chat.chatroom.repository;

import com.example.backend.chat.chatroom.entity.ChatRoom;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // ChatRoomRepository.java
    @Query("""
    SELECT cr FROM ChatRoom cr
    JOIN cr.chatUserList cu1
    JOIN cr.chatUserList cu2
    WHERE cu1.user.id = :userId1 AND cu2.user.id = :userId2
    GROUP BY cr.id
    HAVING COUNT(DISTINCT cu1.user.id) = 1 AND COUNT(DISTINCT cu2.user.id) = 1
""")
    Optional<ChatRoom> findByUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

}
