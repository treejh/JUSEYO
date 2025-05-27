package com.example.backend.domain.notification.controller;



import com.example.backend.domain.notification.repository.NotificationRepository;
import com.example.backend.domain.user.entity.User;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import com.example.backend.domain.inventory.inventoryOut.service.InventoryOutService;
import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.Notification;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.alert.NewChatNotificationService;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.global.security.jwt.service.TokenService;
import com.example.backend.domain.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.example.backend.domain.notification.dto.NotificationPageResponseDTO;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "알림 컨트롤러")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final InventoryOutService inventoryOutService; // 재고 알림 테스트용
    private final TokenService tokenService;
    private final NewChatNotificationService newChatNotificationService;
    private final UserService userService;
    private final NotificationRepository notificationRepository;

    // 알림 생성
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "알림 생성",
            description = "알림을 생성합니다."
    )
    public Notification createNotification(@RequestBody NotificationRequestDTO notificationRequest) {
        return notificationService.createNotification(notificationRequest);
    }

    // 특정 유저의 알림 조회
    @Operation(
            summary = "특정 유저의 알림 조회",
            description = "특정 유저의 알림을 조회합니다."
    )
    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsByUser(@PathVariable Long userId) {

        if (!userId.equals(tokenService.getIdFromToken())) {
            throw new BusinessLogicException(ExceptionCode.NOTIFICATION_DENIED_EXCEPTION);
        }

        return notificationService.getNotificationsByUser(userId);
    }

    // 알림 조회 페이징
    @GetMapping
    public ResponseEntity<NotificationPageResponseDTO> getNotifications(
            @RequestParam(required = false) NotificationType type,
            @RequestParam(required = false) Boolean unreadOnly,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = tokenService.getIdFromToken();
        User user = userService.findById(userId);

        NotificationPageResponseDTO notifications = notificationService.getNotifications(
                user.getId(),
                type,
                unreadOnly,
                pageable
        );

        return ResponseEntity.ok(notifications);
    }


    // 알림 읽음 처리
    @PutMapping("/{notificationId}/read")
    @Operation(
            summary = "알림 읽음 처리",
            description = "알림을 읽음 처리합니다."
    )
    public Notification markAsRead(@PathVariable Long notificationId) {
        return notificationService.markAsRead(notificationId);
    }

    // 유저별 전체 알림 읽음 처리
    @PutMapping("/readAll")
    @Operation(
            summary = "전체 알림 읽음 처리",
            description = "알림을 전체 읽음 처리합니다."
    )
    public ResponseEntity<Void> markAllAsReadForCurrentUser() {
        Long userId = tokenService.getIdFromToken();
        notificationService.markAsReadAllByUser(userId);
        return ResponseEntity.ok().build();
    }

    // 알림 개별 삭제
    @DeleteMapping("/delete")
    @Operation(
            summary = "알림 개별 삭제",
            description = "알림을 개별적으로 삭제합니다."
    )
    public ResponseEntity<Void> deleteNotification(@RequestParam Long notificationId) {
        notificationRepository.deleteById(notificationId);
        return ResponseEntity.ok().build();
    }

    // 읽은 알림 전체 삭제
    @DeleteMapping("/deleteAll")
    @Operation(
            summary = "읽은 알림 전체 삭제",
            description = "읽은 알림을 전부 삭제합니다."
    )
    public ResponseEntity<Void> deleteAllNotifications() {
        Long userId = tokenService.getIdFromToken();
        notificationService.deleteAllReadNotificationsByUserId(userId);
        return ResponseEntity.noContent().build(); // HTTP 204
    }

    // SSE를 통한 실시간 알림 전송
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(
            summary = "SSE 연결",
            description = "SSE 연결합니다."
    )
    public SseEmitter streamNotifications() throws IOException {

        Long userId = tokenService.getIdFromToken();
        System.out.println("📡 인증된 SSE 요청: userId = " + userId);
        return notificationService.streamNotifications(userId);
    }

}
