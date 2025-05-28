package com.example.backend.domain.notification.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class NewManagerApprovedEvent {
    Long requesterId;
    String managerName;
}
