package com.example.backend.domain.notification.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class NewDashboardApprovedEvent {
    private final Long dashboardId;
    private final String dashboardName;
}
