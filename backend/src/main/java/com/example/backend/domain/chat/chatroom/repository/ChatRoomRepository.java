package com.example.backend.domain.chat.chatroom.repository;

import com.example.backend.domain.chat.chatroom.entity.ChatRoom;
import com.example.backend.enums.ChatRoomType;
import com.example.backend.enums.ChatStatus;
import com.example.backend.domain.user.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query("""
    SELECT cr FROM ChatRoom cr
    JOIN cr.chatUserList cu1
    JOIN cr.chatUserList cu2
    WHERE cr.roomType = :roomType
      AND (
        (cu1.user.id = :userId1 AND cu2.user.id = :userId2)
        OR
        (cu1.user.id = :userId2 AND cu2.user.id = :userId1)
      )
    GROUP BY cr.id
    HAVING COUNT(DISTINCT cu1.user.id) = 1 AND COUNT(DISTINCT cu2.user.id) = 1
""")
    Optional<ChatRoom> findByUsersAndRoomType(
            @Param("userId1") Long userId1,
            @Param("userId2") Long userId2,
            @Param("roomType") ChatRoomType roomType
    );

    @Query("""
    SELECT cr FROM ChatRoom cr
    JOIN cr.chatUserList cu
    LEFT JOIN ChatMessage cm ON cm.chatRoom = cr
    WHERE cu.user = :user AND cr.roomType = :roomType AND cu.chatStatus IN :statuses
    GROUP BY cr.id
    ORDER BY MAX(cm.createdAt) DESC NULLS LAST
""")
    Page<ChatRoom> findRoomsByUserAndRoomTypeOrderByLatestMessage(
            @Param("user") User user,
            @Param("roomType") ChatRoomType roomType,
            @Param("statuses") List<ChatStatus> statuses,
            Pageable pageable
    );


}
