package com.example.backend.chat.handler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {
        log.info("[Handshake] beforeHandshake 진입");

        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpServletRequest = servletRequest.getServletRequest();

            String accessToken = null;

            // ✅ 1. Query parameter로 accessToken 받기
            accessToken = httpServletRequest.getParameter("accessToken");

            // ✅ 2. Cookie로도 받을 수 있도록 fallback
            if (accessToken == null) {
                if (httpServletRequest.getCookies() != null) {
                    for (var cookie : httpServletRequest.getCookies()) {
                        if ("accessToken".equals(cookie.getName())) {
                            accessToken = cookie.getValue();
                            break;
                        }
                    }
                }
            }

            log.info("[Handshake] 추출된 accessToken: {}", accessToken);

            if (accessToken != null) {
                attributes.put("accessToken", accessToken); // 👉 StompHandler에서 꺼낼 수 있게 저장
            }
        }

        return true; // handshake 허용
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
    ) {
        log.info("[Handshake] afterHandshake 완료");
    }
}
