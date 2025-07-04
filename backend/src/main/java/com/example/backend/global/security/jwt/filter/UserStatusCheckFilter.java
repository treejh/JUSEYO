package com.example.backend.global.security.jwt.filter;

import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.Status;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.global.security.jwt.service.TokenService;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class UserStatusCheckFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final TokenService tokenService;

    public UserStatusCheckFilter(UserRepository userRepository, TokenService tokenService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = tokenService.getTokenFromRequest();

        if (token != null && tokenService.validateToken(token)) {
            Long userId = tokenService.getIdFromToken();
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

            if (user.getStatus() == Status.STOP) {
                // 정지된 사용자 접근 차단
                response.sendError(HttpStatus.FORBIDDEN.value(), "정지된 사용자는 접근할 수 없습니다.");
                return;
            }

            // 요청 상태 사용자 접근 제한
            if (user.getApprovalStatus() == ApprovalStatus.REQUESTED) {
                String path = request.getRequestURI();

                // 허용할 경로 목록
                boolean allowed = path.startsWith("/api/v1/users/signup")
                        || path.equals("/api/v1/users/login")
                        || path.equals("/api/v1/users/logout")
                        || path.equals("/api/v1/users/emails/findPassword")
                        || path.startsWith("/api/v1/users/emails/**")
                        || path.startsWith("/api/v1/users/duplication/**")
                        || path.startsWith("/api/v1/users/token");

                if (!allowed) {
                    response.sendError(HttpStatus.FORBIDDEN.value(), "요청 상태 사용자입니다.");
                    return;
                }
            }
        }


        filterChain.doFilter(request, response);
    }
}
