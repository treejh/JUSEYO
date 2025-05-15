package com.example.backend.notification.strategy;

public interface NotificationStrategy {
    String generateMessage(Object context);
    // 필요하면 triggerCondition(...) 같은 것도 여기에 선언 가능

    boolean shouldTrigger(Object context); // context를 넘겨 조건 판단

}