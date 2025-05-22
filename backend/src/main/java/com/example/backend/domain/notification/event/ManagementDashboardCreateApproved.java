package com.example.backend.domain.notification.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class ManagementDashboardCreateApproved {
    private final Long managerId;
    private final String dashboardName;
}
