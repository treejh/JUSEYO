package com.example.backend.domain.notification.controller;



import com.example.backend.domain.Inventory.inventoryOut.service.InventoryOutService;
import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.Notification;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NewChatNotificationService;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.global.security.jwt.service.TokenService;
import com.example.backend.domain.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final InventoryOutService inventoryOutService; // 재고 알림 테스트용
    private final TokenService tokenService;
    private final NewChatNotificationService newChatNotificationService;
    private final UserService userService;

    // 1. 알림 생성
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Notification createNotification(@RequestBody NotificationRequestDTO notificationRequest) {
        return notificationService.createNotification(notificationRequest);
    }

    // 2. 특정 유저의 알림 조회
    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsByUser(@PathVariable Long userId) {
        return notificationService.getNotificationsByUser(userId);
    }

    // 3. 알림 읽음 처리
    @PutMapping("/{notificationId}/read")
    public Notification markAsRead(@PathVariable Long notificationId) {
        return notificationService.markAsRead(notificationId);
    }

    // 4. 전체 알림 읽음 처리
    @PutMapping("/readAll")
    public ResponseEntity<Void> markAllAsReadForCurrentUser() {
        Long userId = tokenService.getIdFromToken();
        notificationService.markAsReadAllByUser(userId);
        return ResponseEntity.ok().build();
    }


    // SSE를 통한 실시간 알림 전송
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications() throws IOException {
        Long userId = tokenService.getIdFromToken();
        System.out.println("📡 인증된 SSE 요청: userId = " + userId);
        return notificationService.streamNotifications(userId);
    }

//    // 채팅 전용 알림
//    @PostMapping("/chat")
//    public ResponseEntity<Void> createChatNotification(@RequestBody NewChatNotificationDTO request) {
//        User user = userService.findById(request.getSenderId());
//        String senderName = user.getName();
//        RoleType senderRole = user.getRole().getRole();
//        newChatNotificationService.notifyNewChat(request.getTargetUserId(), request.getRoomId(), senderRole, senderName);
//        return ResponseEntity.ok().build();
//    }



    // 테스트용 알림 보내기 API
    @PostMapping("/test/{userId}")
    public Notification sendTestNotification(@PathVariable Long userId) {
        NotificationRequestDTO testRequest = new NotificationRequestDTO(
                NotificationType.SUPPLY_REQUEST,
                "🔔 테스트 알림입니다!",
                userId
        );

        return notificationService.createNotification(testRequest);
    }

    // 재고 알림 테스트용
    @PostMapping("/test/stockDown")
    public void stockDownAlertTest() {
        inventoryOutService.stockdown();
    }
}
