package com.example.backend.exception;

public class UnauthorizedException extends RuntimeException {

    private final String exception;
    private final String message;

    public UnauthorizedException(final String exception, final String message) {
        super(message);
        this.exception = exception;
        this.message = message;
    }

    public static UnauthorizedException of(final String exception, final String errorMessage) {
        return new UnauthorizedException(exception, errorMessage);
    }

    @Override
    public String getMessage() {
        return String.format("{exception : %s, message : %s}", this.exception, this.message);
    }
}

