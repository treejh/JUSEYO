package com.example.backend.notification.controller;



import com.example.backend.inventoryOut.service.InventoryOutService;
import com.example.backend.notification.dto.NotificationRequestDTO;
import com.example.backend.notification.entity.Notification;
import com.example.backend.notification.entity.NotificationType;
import com.example.backend.notification.service.NotificationService;
import com.example.backend.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
    public Notification markAsRead(@PathVariable String notificationId) {
        return notificationService.markAsRead(notificationId);
    }

    // SSE를 통한 실시간 알림 전송
    @GetMapping(value = "/stream/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(@PathVariable Long userId) throws IOException {
        System.out.println("📡 SSE 요청 받음: userId = " + userId);

        return notificationService.streamNotifications(userId);
    }

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

    // 재고 알림 테스트용 알림
    @PostMapping("/test/stockDown")
    public void stockDownAlertTest() {
        inventoryOutService.stockdown();
    }
}
