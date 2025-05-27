package com.example.backend.domain.notification.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class NewManagerEvent {
    Long requesterManagementDashboardId;
    String requesterName;
}
