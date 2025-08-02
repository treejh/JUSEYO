package com.example.backend.domain.chat.redis;

import com.example.backend.domain.chat.chatMessage.dto.response.ChatResponseDto;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import java.lang.reflect.Method;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RedisLockAspect {

    private final RedissonClient redissonClient;

    @Autowired
    private RedisTemplate<String, Object> chatMessageRedisTemplate;

    @Value("${redis-custom.lock-retry}")
    private int lockRetry;


    @Value("${redis-custom.delay-Millis}")
    private int delayMillis;

    /**
     * Redis 분산 락 처리 AOP
     */
    @Around("@annotation(redisCacheLock)")
    public Object around(ProceedingJoinPoint joinPoint, RedisCacheLock redisCacheLock) throws Throwable {
        String lockKey = resolveKey(joinPoint, redisCacheLock.key());
        RLock lock = redissonClient.getLock("lock:" + lockKey);

        boolean locked = false;

        StopWatch sw = new StopWatch();
        sw.start();

        try {
            locked = lock.tryLock(
                    redisCacheLock.waitTime(),
                    redisCacheLock.leaseTime(),
                    TimeUnit.SECONDS
            );

            if (!locked) {
                log.warn("🔒 Redis 락 획득 실패 - 캐시 재시도 진입 (Key: {})", lockKey);
                Object retryResult = retryGetFromRedis(lockKey);
                if (retryResult != null) return retryResult;

                log.warn("🔒 캐시 재시도 실패 - 비즈니스 로직 실행 (Key: {})", lockKey);
                return joinPoint.proceed();
            }

            // 락 획득 성공 → 비즈니스 로직 실행
            return joinPoint.proceed();

        }
        catch (InterruptedException e) {
             // 스레드의 인터럽트 상태를 복구
            Thread.currentThread().interrupt();
            throw new BusinessLogicException(ExceptionCode.REDIS_LOCK_INTERRUPTED);
        }finally {
            if (locked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
            sw.stop();
            log.info("🔓 Redis 락 종료 (Key: {}, 실행 시간: {}ms)", lockKey, sw.getTotalTimeMillis());
        }
    }

    /**
     * 캐시 키 재조회 로직 - 락 실패 시 일정 시간 대기하며 재시도
     */
    private Object retryGetFromRedis(String redisKey) throws InterruptedException {
        String actualDataKey = redisKey.replaceFirst("^lock:", "");

        for (int i = 0; i < lockRetry; i++) {
            List<Object> rawCached = chatMessageRedisTemplate.opsForList().range(actualDataKey, 0, -1);
            if (rawCached != null && !rawCached.isEmpty()) {
                List<ChatResponseDto> cached = rawCached.stream()
                        .map(obj -> (ChatResponseDto) obj)
                        .toList();
                int size = cached.size();
                log.info("📦 [Redis HIT after Lock 실패 - 재시도 {}회] (Key: {})", i + 1, actualDataKey);
                return new PageImpl<>(cached, PageRequest.of(0, size == 0 ? 1 : size), size);
            }

            Thread.sleep(delayMillis);
        }

        return null;
    }



    /**
     * SpEL 표현식을 실제 파라미터로 변환하여 키 생성
     */
    private String resolveKey(ProceedingJoinPoint joinPoint, String keyExpr) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        EvaluationContext context = new StandardEvaluationContext();
        Object[] args = joinPoint.getArgs();
        String[] paramNames = new DefaultParameterNameDiscoverer().getParameterNames(method);

        if (paramNames != null) {
            for (int i = 0; i < paramNames.length; i++) {
                context.setVariable(paramNames[i], args[i]);
            }
        }

        return new SpelExpressionParser().parseExpression(keyExpr).getValue(context, String.class);
    }
}
