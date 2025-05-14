package com.example.backend.chat.handler;

import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.security.jwt.util.JwtTokenizer;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {

    private final JwtTokenizer jwtTokenizer;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // WebSocket 연결 시점
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.info("[WebSocket] CONNECT 시도");

            // ✅ 1. 쿠키 헤더 추출
            String cookieHeader = accessor.getFirstNativeHeader("cookie"); // WebSocket은 소문자 "cookie"로 넘어옴

            if (cookieHeader == null || cookieHeader.isBlank()) {
                throw new BusinessLogicException(ExceptionCode.TOKEN_NOT_FOUND);
            }

            // ✅ 2. access_token 쿠키 추출
            String accessToken = Arrays.stream(cookieHeader.split(";"))
                    .map(String::trim)
                    .filter(c -> c.startsWith("accessToken="))
                    .map(c -> c.substring("accessToken=".length()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessLogicException(ExceptionCode.FILTER_ACCESS_DENIED));

            // ✅ 3. 검증
            jwtTokenizer.validateToken(accessToken);
            Claims claims = jwtTokenizer.parseAccessToken(accessToken);

            String username = claims.getSubject();
            log.info("[WebSocket] 인증된 사용자: {}", username);

            // 여기서 SecurityContext 저장하려면 직접 처리 가능
        }

        return message;
    }
}
