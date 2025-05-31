package com.example.backend.enums;

public enum ApprovalStatus {
    REQUESTED,        // 요청 대기
    APPROVED,         // 승인
    REJECTED,          //거부
    RETURN_PENDING,   // 반납 대기
    RETURN_REJECTED,  // 반납 거부
    RETURNED          // 반납 완료
}
