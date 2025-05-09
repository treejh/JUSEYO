package com.example.backend.exception;

import lombok.Getter;

public enum ExceptionCode {
     BLOG_NOT_FOUND(404, "블로그를 찾을 수 없습니다."),
    S3_DELETE_ERROR(404, "이미지를 삭제할 수 없습니다."),
     USER_NOT_FOUND(404,"유저를 찾을 수 없습니다. "),
    BOARD_NOT_FOUND(404,"게시판을 찾을 수 없습니다. "),
    TOKEN_NOT_FOUND(404,"토큰 찾을 수 없습니다. "),//삭제 해도 됨
    ALREADY_HAS_BLOG(404, "블로그를 이미 가지고 있습니다."),
    ROLE_NOT_FOUND(404,"존재하지 않는 역할입니다."),
    DEPARTMENT_NOT_FOUND(404,"존재하지 않는 부서입니다."),
    MANAGEMENT_DASHBOARD_NOT_FOUND(404,"존재하지 않는 관리 페이지입니다."),
    ALREADY_HAS_EMAIL(404,"이미 존재하는 이메일입니다."),
    ALREADY_HAS_PHONENUMBER(404,"이미 존재하는 전화번호입니다."),
    INVALID_PASSWORD(404,"비밀번호가 일치하지 않습니다."),
    AlREADY_HAS_DEPARTMENT(404, "이미 존재하는 부서입니다.");



    @Getter
    private int status;

    @Getter
    private String message;

    ExceptionCode(int code, String message) {
        this.status = code;
        this.message = message;
    }
}