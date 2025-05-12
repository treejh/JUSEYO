package com.example.backend.exception;

import lombok.Getter;

public enum ExceptionCode {
    MAIN_DASHBOARD_NOT_FOUND(404,"존재하지 않는 메인 페이지 입니다"),
    S3_DELETE_ERROR(404, "이미지를 삭제할 수 없습니다."),
    USER_NOT_FOUND(404,"유저를 찾을 수 없습니다. "),
    BOARD_NOT_FOUND(404,"게시판을 찾을 수 없습니다. "),
    TOKEN_NOT_FOUND(404,"토큰 찾을 수 없습니다. "),//삭제 해도 됨
    ALREADY_HAS_BLOG(404, "블로그를 이미 가지고 있습니다."),
    ROLE_NOT_FOUND(404,"존재하지 않는 역할입니다."),
    UNAUTHORIZED_ROLE(403, "접근 권한이 없는 역할입니다."),
    USER_NOT_IN_MANAGEMENT_DASHBOARD(403, "해당 관리 페이지에 속한 유저가 아닙니다."),
    DEPARTMENT_NOT_FOUND(404,"존재하지 않는 부서입니다."),
    EMAIL_NOT_FOUND(404,"존재하지 않는 이메일입니다."),
    PHONE_NUMBER_NOT_FOUND(404,"핸드폰 번호를 찾을 수 없습니다."),
    MANAGEMENT_DASHBOARD_NOT_FOUND(404,"존재하지 않는 관리 페이지입니다."),
    ALREADY_HAS_EMAIL(409,"이미 존재하는 이메일입니다."),
    ALREADY_HAS_PHONENUMBER(409,"이미 존재하는 전화번호입니다."),
    ALREADY_HAS_BUSINESSREGISTRATIONNUMBER(409,"이미 존재하는 사업자 번호 입니다"),
    INVALID_PASSWORD(401,"비밀번호가 일치하지 않습니다."),
    AlREADY_HAS_DEPARTMENT(404, "이미 존재하는 부서입니다."),
    ITEM_NOT_FOUND(404, "비품을 찾을 수 없습니다."),
    INVENTORY_IN_NOT_FOUND(404, "입고내역을 찾을 수 없습니다."),
    INVENTORY_OUT_NOT_FOUND(404, "출고내역을 찾을 수 없습니다."),
    SUPPLY_REQUEST_NOT_FOUND(404, "비품 요청서를 찾을 수 없습니다."),
    SUPPLY_RETURN_NOT_FOUND(404,"비품 반납서를 찾을 수 없습니다."),
    INSUFFICIENT_STOCK(400, "비품 보유 수량이 부족합니다."),
    CATEGORY_NOT_FOUND(404, "카테고리를 찾을 수 없습니다."),
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