package com.example.backend.global.exception;

import lombok.Getter;

public enum ExceptionCode {
    MAIN_DASHBOARD_NOT_FOUND(404,"존재하지 않는 메인 페이지 입니다"),
    USER_NOT_FOUND(404,"유저를 찾을 수 없습니다. "),
    BOARD_NOT_FOUND(404,"게시판을 찾을 수 없습니다. "),
    TOKEN_NOT_FOUND(404,"토큰 찾을 수 없습니다. "),//삭제 해도 됨
    DEPARTMENT_NOT_FOUND(404,"존재하지 않는 부서입니다."),
    ALREADY_HAS_BUSINESSREGISTRATIONNUMBER(409,"이미 존재하는 사업자 번호 입니다"),
    INVALID_PASSWORD(401,"비밀번호가 일치하지 않습니다."),
    AlREADY_HAS_DEPARTMENT(404, "이미 존재하는 부서입니다."),
    ITEM_NOT_FOUND(404, "비품을 찾을 수 없습니다."),
    ITEM_INSTANCE_NOT_FOUND(404, "존재하지 않는 개별 자산 입니다. "),
    INVENTORY_IN_NOT_FOUND(404, "입고내역을 찾을 수 없습니다."),
    INVENTORY_OUT_NOT_FOUND(404, "출고내역을 찾을 수 없습니다."),
    SUPPLY_REQUEST_NOT_FOUND(404, "비품 요청서를 찾을 수 없습니다."),
    SUPPLY_RETURN_NOT_FOUND(404,"비품 반납서를 찾을 수 없습니다."),
    INSUFFICIENT_STOCK(400, "비품 보유 수량이 부족합니다."),
    CATEGORY_NOT_FOUND(404, "카테고리를 찾을 수 없습니다."),
    ACCESS_DENIED(404,"권한이 없습니다. "),
    INVALID_REQUEST_STATUS(400, "요청 상태가 유효하지 않아 수정할 수 없습니다."),
    INVALID_RETURN_DATE(400, "대여 시 반납 날짜를 반드시 입력해야 합니다."),
    REGISTER_ITEM_NOT_FOUND(404, "비품 구매서를 찾을 수 없습니다."),
    INVALID_INBOUND_TYPE(404, "적합하지 않은 입고 유형입니다"),
    ITEM_NAME_EXISTS(400,"이미 동일한 이름의 비품이 존재합니다."),

    //채팅 예외처리
    INVALID_CHAT_ROOM_TYPE(403,"지원하지 않는 채팅방 타입입니다."),
    CHAT_ROOM_FOUND(404,"존재하지 않는 채팅방입니다."),
    NOT_ENTER_CHAT_ROOM(404,"참여중인 채팅방이 아닙니다."),
    ALREADY_ENTER_CHAT_ROOM(403,"이미 채팅방에 입장했습니다."),
    FILTER_ACCESS_DENIED(403, "접근이 거부되었습니다. 권한이 부족합니다."),

    //유저 예외 처리
    NOT_INITIAL_MANAGER(403, "해당 기능은 최초 생성 매니저만 사용할 수 있습니다."),
    NOT_ADMIN(403, "해당 기능은 최초 최고 관리자(Admin)만 사용할 수 있습니다."),
    NOT_MANAGER(403, "해당 기능은 매니저만 사용할 수 있습니다."),
    INVALID_APPROVAL_TARGET_ROLE(400, "승인 대상 유저는 매니저 권한을 가져야 합니다."),
    ROLE_NOT_FOUND(404,"존재하지 않는 역할입니다."),
    UNAUTHORIZED_ROLE(403, "접근 권한이 없는 역할입니다."),
    EMAIL_VERIFICATION_FAILED(400, "이메일 인증을 실패하였습니다."),
    MANAGER_NOT_FOUND(404,"매니저를 찾을 수 없습니다."),
    INITIAL_MANAGER_CANNOT_WITHDRAW(403,"최초 매니저는 탈퇴할 수 없습니다."),

    //회원가입 예외 처리
    ALREADY_HAS_EMAIL(409,"이미 존재하는 이메일입니다."),
    ALREADY_HAS_PHONE_NUMBER(409,"이미 존재하는 전화번호입니다."),
    INVALID_REFRESH_TOKEN(401, "유효하지 않은 리프레시 토큰입니다. 다시 로그인해주세요."),

    //S3 예외 처리
    S3_DELETE_ERROR(404, "이미지를 삭제할 수 없습니다."),
    IMAGE_NOT_FOUND(404,"이미지를 찾을 수 없습니다."),


    //로그인 예외 처리
    EMAIL_NOT_FOUND(404,"존재하지 않는 이메일입니다."),
    PHONE_NUMBER_NOT_FOUND(404,"핸드폰 번호를 찾을 수 없습니다."),

    //관리자 페이지 예외 처리
    ALREADY_HAS_MANAGEMENT_DASHBOARD(404, "이미 존재하는 관리페이지 입니다."),
    USER_HAS_MANAGEMENT_DASHBOARD(404, "이미 관리자페이지에 속해있습니다."),
    USER_NOT_IN_MANAGEMENT_DASHBOARD(403, "해당 관리 페이지에 속한 유저가 아닙니다."),
    MANAGEMENT_DASHBOARD_NOT_FOUND(404,"존재하지 않는 관리 페이지입니다."),

    //부서 예외 처리
    DEPARTMENT_NOT_IN_DASHBOARD(403, "해당 관리 페이지에 속한 부서가 아닙니다."),

    //카테고리 예외 처리
    CATEGORY_ALREADY_EXISTS(409, "이미 존재하는 카테고리입니다."),

    // 알림 예외 처리
    NOTIFICATION_DENIED_EXCEPTION(403, "다른 사용자의 알림은 조회할 수 없습니다."),
    NOTIFICATION_NOT_FOUND(404, "알림을 찾을 수 없습니다."),

    ;

    @Getter
    private int status;

    @Getter
    private String message;

    ExceptionCode(int code, String message) {
        this.status = code;
        this.message = message;
    }
}