package com.example.backend.chat.chatroom.entity;

import com.example.backend.auditable.Auditable;
import com.example.backend.chat.chatMessage.entity.ChatMessage;
import com.example.backend.chat.chatUser.entity.ChatUser;
import com.example.backend.enums.ChatRoomType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "chat_rooms")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class ChatRoom extends Auditable { // Auditable 상속


    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_name", length = 100)
    private String roomName;

    @Column(name = "room_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ChatRoomType roomType;


    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.REMOVE, orphanRemoval = true,  fetch = FetchType.EAGER)
    List<ChatUser> chatUserList = new ArrayList<>();


    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.REMOVE, orphanRemoval = true,  fetch = FetchType.EAGER)
    List<ChatMessage> chatMessageListi = new ArrayList<>();

}