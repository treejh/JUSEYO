// src/main/java/com/example/backend/global/lock/RedisCacheLock.java

package com.example.backend.domain.chat.redis;

import java.lang.annotation.*;
import java.util.concurrent.TimeUnit;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RedisCacheLock {
    String key(); // SpEL 표현식으로 락 키 지정
    long waitTime() default 1; // 락 대기 시간 (초)
    long leaseTime() default 5; // 락 유지 시간 (초)
    TimeUnit timeUnit() default TimeUnit.SECONDS;
}
