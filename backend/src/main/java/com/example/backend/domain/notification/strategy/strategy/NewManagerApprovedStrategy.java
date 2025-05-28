package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.NewManagerContext;

public class NewManagerApprovedStrategy implements NotificationStrategy {

    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof NewManagerContext)) {
            throw new IllegalArgumentException("Invalid context for ManagerApproved Strategy");
        }
        NewManagerContext ctx = (NewManagerContext) context;
        return ctx.getRequesterName() +"님의 매니저 권한이 승인되었습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        return true;
    }
}
