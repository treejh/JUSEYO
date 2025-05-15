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
            log.info("Token 들어오는지 확인11: {}", accessor.getNativeHeader("accessToken"));
            String token = tokenService.getTokenFromRequest();
            log.info("Token 들어오는지 확인22: {}", token);
//            log.info("[WebSocket] CONNECT 시도");
//            log.info("Received headers: {}", accessor.toNativeHeaderMap());
//            // ✅ 1. 쿠키 헤더 추출
//            String cookieHeader = accessor.getFirstNativeHeader("cookie"); // WebSocket은 소문자 "cookie"로 넘어옴
//            log.info("여기까지오나 ?????? hihi 22 ");
//            log.info("cokieHeader 확인 !!!!!!" + cookieHeader);
//

            if (token == null || token.isBlank()) {
                log.info("cookieHeader 오류!! 33 ");
                throw new BusinessLogicException(ExceptionCode.TOKEN_NOT_FOUND);
            }

            log.info("Token 들어오는지 확인: {}22", token);

//            log.info("여기까지오나 ?????? hihi 33");
//            // ✅ 2. access_token 쿠키 추출
//            String accessToken = Arrays.stream(cookieHeader.split(";"))
//                    .map(String::trim)
//                    .filter(c -> c.startsWith("accessToken="))
//                    .map(c -> c.substring("accessToken=".length()))
//                    .findFirst()
//                    .orElseThrow(() -> new BusinessLogicException(ExceptionCode.FILTER_ACCESS_DENIED));
//            log.info("여기까지오나 ?????? hihi 44" + accessToken.substring(1,4));
//            // ✅ 3. 검증

            jwtTokenizer.validateToken(token);
            Claims claims = jwtTokenizer.parseAccessToken(token);

            String username = claims.getSubject();
            log.info("[WebSocket] 인증된 사용자: {}", username);

            // 여기서 SecurityContext 저장하려면 직접 처리 가능
        }

        return message;
    }
}
