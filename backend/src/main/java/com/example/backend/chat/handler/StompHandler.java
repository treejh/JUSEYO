package com.example.backend.chat.handler;

import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.security.jwt.service.TokenService;
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
    private final TokenService tokenService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        // WebSocket 연결 시점
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = (String) accessor.getSessionAttributes().get("accessToken");
            log.info("WebSocket CONNECT: 추출된 토큰: {}", token);

            if (token == null) {
                throw new BusinessLogicException(ExceptionCode.TOKEN_NOT_FOUND);
            }

            jwtTokenizer.validateToken(token);
            Claims claims = jwtTokenizer.parseAccessToken(token);
            String username = claims.getSubject();
            log.info("[WebSocket] 인증된 사용자: {}", username);
            accessor.setUser(new StompPrincipal(username)); // WebSocket에서 principal로 전달
        }

        return message;
    }
}
