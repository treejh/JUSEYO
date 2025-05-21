package com.example.backend.global.exception;

import lombok.Getter;


public class BusinessLogicException extends RuntimeException {
    @Getter
    private ExceptionCode exceptionCode;

    public BusinessLogicException(ExceptionCode exceptionCode) {
        super(exceptionCode.getMessage());
        this.exceptionCode = exceptionCode;
    }


    public ExceptionCode getCode() {
        return exceptionCode;
    }

    public BusinessLogicException(ExceptionCode code, String detailMessage) {
        super(detailMessage);
        this.exceptionCode = code;
    }

}