package com.example.backend.notification.entity;

public enum NotificationType {

    // 매니저 알림
    SUPPLY_REQUEST("비품 요청"),                   // (회원->매니저) 비품 요청
    SUPPLY_RETURN("비품 반납 알림"),
    SUPPLY_RETURN_ALERT("비품 반납 알림(고장/불량 비품 신고)"), // (회원->매니저) 비품 반납 알림
    STOCK_REACHED("재고 도달"),                    // 재고 도달
    STOCK_SHORTAGE("재고 부족"),                   // 재고 부족
    SUPPLY_REQUEST_MODIFIED("비품 요청 수정"),     // 비품 요청 수정
    RETURN_DUE_DATE_EXCEEDED("지정 반납일 초과"),  // 지정 반납일 초과
    LONG_TERM_UNRETURNED_SUPPLIES("장기 미반납 비품 목록 알림"), // 장기 미반납 비품 목록 알림
    USER_SENT_MESSAGE_TO_MANAGER("채팅 알림"),

    // 회원 알림
    SUPPLY_REQUEST_APPROVED("비품 요청 승인"),      // 비품 요청 승인
    SUPPLY_REQUEST_REJECTED("비품 요청 반려"),      // 비품 요청 반려
    RETURN_DUE_SOON("지정 반납일 임박"),   // 지정 반납일 임박 (사용자 행동 유도)
    SUPPLY_REQUEST_DELAYED("비품 요청 처리 지연"),  // 비품 요청 처리 지연 (사용자 행동 유도)

    // 매니저 기타 알림
    ADMIN_APPROVAL_ALERT("관리 페이지 승인 알림"), // 관리 페이지 승인 알림 (어드민 -> 이니셜 매니저)
    MANAGER_APPROVAL_ALERT("매니저 승인 알림"),     // 매니저 승인 알림 (이니셜 매니저 -> 새 매니저)

    // 공통 알림
    SYSTEM_MAINTENANCE("시스템 점검 알림"),        // 시스템 점검 알림
    NEW_CHAT("새로운 채팅 알림");   // 새로운 채팅 알림(회원 -> 회원 / 회원 -> 매니저)

    private final String description;

    NotificationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

