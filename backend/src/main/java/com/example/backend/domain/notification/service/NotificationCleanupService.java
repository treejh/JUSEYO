package com.example.backend.domain.notification.service;

import com.example.backend.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationCleanupService {
    private final NotificationRepository notificationRepository;

    @Transactional
    @Scheduled(cron = "0 0 0 * * *")  // 배포용
//    @Scheduled(fixedDelay = 60000)  // 테스트용(1분)
    public void scheduledCleanup() {
        cleanup();
    }

    @Transactional
    public void cleanup() {
//        LocalDateTime twoWeeksAgo = LocalDateTime.now().minusWeeks(2);
//        notificationRepository.deleteByCreatedAtBeforeAndReadStatusTrue(twoWeeksAgo); // 배포용
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        notificationRepository.deleteByCreatedAtBeforeAndReadStatusTrue(oneMinuteAgo); // 배포용

    }
}
