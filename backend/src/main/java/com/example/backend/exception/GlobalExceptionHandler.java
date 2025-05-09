package com.example.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .badRequest()
                .body("잘못된 요청: " + ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneral(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("서버 오류: " + ex.getMessage());
    }

    @ExceptionHandler(BusinessLogicException.class)
    public ResponseEntity<String> handleBusinessLogic(BusinessLogicException ex) {
        return ResponseEntity
                .status(ex.getExceptionCode().getStatus())
                .body(ex.getExceptionCode().getMessage());
    }
}
