package com.example.backend.domain.notification.notificationPolicy;

import com.example.backend.enums.RoleType;
import com.example.backend.domain.notification.entity.NotificationType;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class NotificationPolicy {

    public static List<NotificationType> getAllowedTypesByRole(RoleType role) {
        return switch (role) {
            case MANAGER -> Arrays.asList(
                    NotificationType.SUPPLY_REQUEST,
                    NotificationType.SUPPLY_RETURN,
                    NotificationType.STOCK_SHORTAGE,
                    NotificationType.RETURN_DUE_DATE_EXCEEDED,
                    NotificationType.NOT_RETURNED_YET,
                    NotificationType.ADMIN_APPROVAL_ALERT,
                    NotificationType.ADMIN_REJECTION_ALERT,
                    NotificationType.MANAGER_APPROVAL_ALERT,
                    NotificationType.MANAGER_REJECTION_ALERT,
                    NotificationType.NEW_CHAT

            );
            case USER -> Arrays.asList(
                    NotificationType.SUPPLY_REQUEST_APPROVED,
                    NotificationType.SUPPLY_REQUEST_REJECTED,
                    NotificationType.RETURN_DUE_SOON,
                    NotificationType.SUPPLY_REQUEST_DELAYED,
                    NotificationType.SUPPLY_RETURN_APPROVED,
                    NotificationType.NEW_CHAT


            );
            default -> Collections.emptyList();
        };
    }
}
