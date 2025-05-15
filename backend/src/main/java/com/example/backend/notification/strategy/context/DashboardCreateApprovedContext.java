package com.example.backend.notification.strategy.context;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class DashboardCreateApprovedContext
{
    private final Long managerId;
    private final String dashboardName;
}
