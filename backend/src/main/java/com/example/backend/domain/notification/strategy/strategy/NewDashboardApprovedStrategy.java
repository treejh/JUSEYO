package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.NewDashboardApproveOrNotContext;
import com.example.backend.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class NewDashboardApprovedStrategy implements NotificationStrategy {
    UserService userService;

    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof NewDashboardApproveOrNotContext)) {
            throw new IllegalArgumentException("Invalid context for NewDashboardApproved Strategy");
        }
        NewDashboardApproveOrNotContext ctx = (NewDashboardApproveOrNotContext) context;
        return ctx.getDashboardName() + " 관리 페이지 생성이 승인되었습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        return true;
    }
}

