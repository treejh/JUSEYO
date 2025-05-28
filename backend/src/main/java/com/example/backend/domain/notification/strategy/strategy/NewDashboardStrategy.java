package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.NewChatContext;
import com.example.backend.domain.notification.strategy.context.NewDashboardContext;

public class NewDashboardStrategy implements NotificationStrategy {
    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof NewDashboardContext)) {
            throw new IllegalArgumentException("Invalid context for NewChat Strategy");
        }
        NewDashboardContext ctx = (NewDashboardContext) context;
        return ctx.getRequesterName() + "님으로부터" + ctx.getDashboardName() + " 페이지 생성 승인이 요청되었습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        return true;
    }
}
