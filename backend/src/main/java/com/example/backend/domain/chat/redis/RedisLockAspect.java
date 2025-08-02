package com.example.backend.domain.chat.redis;

import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.core.DefaultParameterNameDiscoverer;
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

    @Around("@annotation(redisCacheLock)")
    public Object around(ProceedingJoinPoint joinPoint, RedisCacheLock redisCacheLock) throws Throwable {
        String lockKey = resolveKey(joinPoint, redisCacheLock.key());
        RLock lock = redissonClient.getLock("lock:" + lockKey);

        boolean locked = false;
        StopWatch sw = new StopWatch();
        sw.start();
        //true -> 락 획득 성공
        locked = lock.tryLock(redisCacheLock.waitTime(), redisCacheLock.leaseTime(), TimeUnit.SECONDS);
        try {
            if (!locked) {
                // 락 못 잡았으면 Redis 재확인 or fallback 처리는 서비스단에서
                throw new IllegalStateException("Redis Lock 획득 실패");
            }

            return joinPoint.proceed(); // 핵심 로직 실행 -> getChatMessage())실행하는거임

        } finally {
            if (locked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
            sw.stop();
            log.info("🔒 락 실행 시간: {}ms (Key: {})", sw.getTotalTimeMillis(), lockKey);
        }
    }

    private String resolveKey(ProceedingJoinPoint joinPoint, String keyExpr) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        EvaluationContext context = new StandardEvaluationContext();
        Object[] args = joinPoint.getArgs();
        String[] paramNames = new DefaultParameterNameDiscoverer().getParameterNames(method);
        for (int i = 0; i < paramNames.length; i++) {
            context.setVariable(paramNames[i], args[i]);
        }

        return new SpelExpressionParser().parseExpression(keyExpr).getValue(context, String.class);
    }
}
