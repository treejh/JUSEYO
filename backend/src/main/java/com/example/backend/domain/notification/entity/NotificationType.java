package com.example.backend.domain.notification.entity;

public enum NotificationType {

    // 어드민
//    NEW_MANAGEMENT_DASHBOARD("새로운 관리 페이지 승인 요청 알림"),

    // 매니저 알림
    SUPPLY_REQUEST("비품 요청"),                   // (회원->매니저) 비품 요청
    SUPPLY_RETURN("비품 반납 알림"),
    STOCK_SHORTAGE("재고 부족"),                   // 재고 부족
    RETURN_DUE_DATE_EXCEEDED("지정 반납일 초과"),  // 지정 반납일 초과
    NOT_RETURNED_YET("장기 미반납 비품 목록 알림"), // 장기 미반납 비품 목록 알림

    ADMIN_APPROVAL_ALERT("관리 페이지 승인 알림"), // 관리 페이지 승인 알림 (어드민 -> 이니셜 매니저)
    ADMIN_REJECTION_ALERT("관리 페이지 거부 알림"), // 관리 페이지 거부 알림 (어드민 -> 이니셜 매니저)

    NEW_MANAGER("새로운 매니저 가입 요청"),
    MANAGER_APPROVAL_ALERT("매니저 승인 알림"),     // 매니저 승인 알림 (이니셜 매니저 -> 새 매니저)
    MANAGER_REJECTION_ALERT("매니저 거부 알림"),     // 매니저 거부 알림 (이니셜 매니저 -> 새 매니저)

    NEW_USER("새로운 회원 가입 요청"),


    // 회원 알림
    SUPPLY_REQUEST_APPROVED("비품 요청 승인"),      // 비품 요청 승인
    SUPPLY_REQUEST_REJECTED("비품 요청 반려"),      // 비품 요청 반려
    RETURN_DUE_SOON("지정 반납일 임박"),   // 지정 반납일 임박 (사용자 행동 유도)
    SUPPLY_REQUEST_DELAYED("비품 요청 처리 지연"),  // 비품 요청 처리 지연 (사용자 행동 유도)
    SUPPLY_RETURN_APPROVED("비품 반납 승인"),
    SUPPLY_RETURN_REJECTED("비품 반납 거부"),

    NEW_USER_APPROVED("회원 가입 요청 승인"),
    NEW_USER_REJECTED("회원 가입 요청 거부"),

    // 공통 알림
//    SYSTEM_MAINTENANCE("시스템 점검 알림"),        // 시스템 점검 알림
    NEW_CHAT("새로운 채팅 알림");   // 새로운 채팅 알림(회원 -> 회원 / 회원 -> 매니저)

    private final String description;

    NotificationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

