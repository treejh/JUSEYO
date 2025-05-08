package com.example.backend.exception;

import lombok.Getter;

public enum ExceptionCode {
     BLOG_NOT_FOUND(404, "블로그를 찾을 수 없습니다."),
    S3_DELETE_ERROR(404, "이미지를 삭제할 수 없습니다."),
     USER_NOT_FOUND(404,"유저를 찾을 수 없습니다. "),
    BOARD_NOT_FOUND(404,"게시판을 찾을 수 없습니다. "), //삭제 해도 됨
    ALREADY_HAS_BLOG(404, "블로그를 이미 가지고 있습니다.");


    @Getter
    private int status;

    @Getter
    private String message;

    ExceptionCode(int code, String message) {
        this.status = code;
        this.message = message;
    }
}