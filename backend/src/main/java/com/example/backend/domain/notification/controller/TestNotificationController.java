package com.example.backend.domain.notification.controller;

import com.example.backend.domain.item.entity.Item;
import com.example.backend.domain.item.repository.ItemRepository;
import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.Notification;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.event.StockShortageEvent;
import com.example.backend.domain.notification.event.SupplyRequestCreatedEvent;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.supply.supplyRequest.dto.request.SupplyRequestRequestDto;
import com.example.backend.domain.supply.supplyRequest.service.SupplyRequestService;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.service.UserService;
import com.example.backend.global.security.jwt.service.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications/test")
@Tag(name = "테스트 알림 컨트롤러")
@RequiredArgsConstructor
public class TestNotificationController {

    private final NotificationService notificationService;
    private final ItemRepository itemRepo;
    private final ApplicationEventPublisher eventPublisher;
    private final TokenService tokenService;
    private final UserService userService;
    private final SupplyRequestService supplyRequestService;


    // 테스트용 알림 보내기 API
    @PostMapping("/{userId}")
    @Operation(
            summary = "재고 요청 테스트 알림",
            description = "재고 요청 테스트 알림을 보냅니다."
    )
    public Notification sendTestNotification(@PathVariable Long userId) {
        NotificationRequestDTO testRequest = new NotificationRequestDTO(
                NotificationType.SUPPLY_REQUEST,
                "🔔 테스트 알림입니다!",
                userId
        );

        return notificationService.createNotification(testRequest);
    }

    // 재고 알림 테스트용
    @PostMapping("/stockDown")
    @Operation(
            summary = "재고 부족 테스트 알림",
            description = "재고 부족 테스트 알림을 보냅니다."
    )
    public void stockDownAlertTest() {
        Item pen = itemRepo.findByName("볼펜").get();
        pen.setAvailableQuantity(pen.getAvailableQuantity() - 3);
        itemRepo.save(pen);
        eventPublisher.publishEvent(new StockShortageEvent(pen.getSerialNumber(), pen.getName(), pen.getAvailableQuantity(), pen.getMinimumQuantity()));
    }

    //
    @PostMapping("/newSupplyRequest")
    @Operation(
            summary = "비품 요청 테스트",
            description = "비품 요청 테스트 알림을 보냅니다."
    )
    public void sendNewSupplyRequest() {
        Item pen = itemRepo.findByName("볼펜").get();
        Long userId = tokenService.getIdFromToken();
        User user = userService.findById(userId);
        SupplyRequestRequestDto dto = new SupplyRequestRequestDto();
        dto.setItemId(pen.getId());
        dto.setQuantity(1L);
        dto.setPurpose("테스트용 요청");
        dto.setRental(false);
        supplyRequestService.createRequest(dto);

    }
}
