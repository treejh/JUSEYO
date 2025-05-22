package com.example.backend.notification.notificationPolicy;

import com.example.backend.enums.RoleType;
import com.example.backend.notification.entity.NotificationType;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class NotificationPolicy {

    public static List<NotificationType> getAllowedTypesByRole(RoleType role) {
        return switch (role) {
            case MANAGER -> Arrays.asList(
                    NotificationType.SUPPLY_REQUEST,
                    NotificationType.SUPPLY_RETURN,
                    NotificationType.SUPPLY_RETURN_ALERT,
                    NotificationType.STOCK_REACHED,
                    NotificationType.STOCK_SHORTAGE,
                    NotificationType.SUPPLY_REQUEST_MODIFIED,
                    NotificationType.RETURN_DUE_DATE_EXCEEDED,
                    NotificationType.LONG_TERM_UNRETURNED_SUPPLIES,
                    NotificationType.USER_SENT_MESSAGE_TO_MANAGER,
                    NotificationType.ADMIN_APPROVAL_ALERT,
                    NotificationType.MANAGER_APPROVAL_ALERT,
                    NotificationType.NEW_CHAT

            );
            case USER -> Arrays.asList(
                    NotificationType.SUPPLY_REQUEST_APPROVED,
                    NotificationType.SUPPLY_REQUEST_REJECTED,
                    NotificationType.RETURN_DUE_SOON,
                    NotificationType.SUPPLY_REQUEST_DELAYED,
                    NotificationType.NEW_CHAT


            );
            default -> Collections.emptyList();
        };
    }
}
