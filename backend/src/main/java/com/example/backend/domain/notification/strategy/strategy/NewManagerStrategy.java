package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.NewManagerContext;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class NewManagerStrategy implements NotificationStrategy {
    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof NewManagerContext)) {
            throw new IllegalArgumentException("Invalid context for ManagerApproved Strategy");
        }
        NewManagerContext ctx = (NewManagerContext) context;
        return ctx.getRequesterName() +"님으로부터 매니저 권한 승인이 요청되었습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        return true;
    }
}
