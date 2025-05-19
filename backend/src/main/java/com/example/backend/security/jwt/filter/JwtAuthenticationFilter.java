package com.example.backend.security.jwt.filter;


import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.exception.JwtExceptionCode;
import com.example.backend.redis.RedisService;
import com.example.backend.security.dto.CustomUserDetails;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.security.jwt.token.JwtAuthenticationToken;
import com.example.backend.security.jwt.util.JwtTokenizer;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;


@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenizer jwtTokenizer;
    private final RedisService redisService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String accessToken = getAccessToken(request);
        String refreshToken = getRefreshToken(request);


        if (accessToken == null && refreshToken == null) {
            filterChain.doFilter(request, response);
            return;
        }

        if (accessToken == null && refreshToken != null) {
            log.info("refreshToken 검사 filter !  " + refreshToken);
            validRefreshToken(refreshToken);
            log.info("refreshToken 33 " + refreshToken);
            if (StringUtils.hasText(refreshToken) && jwtTokenizer.validateRefreshToken(refreshToken)) {
                try {
                    log.info("refreshToken 44 " + refreshToken);
                    setCookies(refreshToken, response);
                    filterChain.doFilter(request, response);
                    return;
                } catch (Exception ex) {
                    log.error("Failed to reissue access token", ex);
                    request.setAttribute("exception", JwtExceptionCode.EXPIRED_TOKEN.getCode());
                    SecurityContextHolder.clearContext();
                    throw new BadCredentialsException("Invalid refresh token", ex);
                }
            }
        }





        if (StringUtils.hasText(accessToken)) {
            try {
                jwtTokenizer.validateAccessToken(accessToken);
                Authentication authentication = getAuthentication(accessToken);

                //만들어진 authentication를 SecurityContextHolder의 SecurityContext 로 넘긴다.
                SecurityContextHolder.getContext().setAuthentication(authentication);


            } catch (ExpiredJwtException e) {
                request.setAttribute("exception", JwtExceptionCode.EXPIRED_TOKEN.getCode());
                if (!StringUtils.hasText(refreshToken)) {
                    log.warn("No refresh token found");

                    SecurityContextHolder.clearContext();
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "refreshToken이 없습니다 재로그인 해주세요.");
                    return;
                }
                if (StringUtils.hasText(refreshToken) && jwtTokenizer.validateRefreshToken(refreshToken)) {
                    try {
                        setCookies(refreshToken,response);
                        filterChain.doFilter(request, response);
                        return;
                    } catch (Exception ex) {
                        log.error("Failed to reissue access token", ex);
                        request.setAttribute("exception", JwtExceptionCode.EXPIRED_TOKEN.getCode());
                        SecurityContextHolder.clearContext();
                        throw new BadCredentialsException("Invalid refresh token", ex);
                    }
                }
                }catch(UnsupportedJwtException e){
                    request.setAttribute("exception", JwtExceptionCode.UNSUPPORTED_TOKEN.getCode());
                    log.error("Unsupported Token: {}", accessToken, e);
                    SecurityContextHolder.clearContext();
                    throw new BadCredentialsException("Unsupported token exception", e);
                } catch(MalformedJwtException e){
                    request.setAttribute("exception", JwtExceptionCode.INVALID_TOKEN.getCode());
                    log.error("Invalid Token: {}", accessToken, e);

                    SecurityContextHolder.clearContext();

                    throw new BadCredentialsException("Invalid token exception", e);
                } catch(IllegalArgumentException e){
                    request.setAttribute("exception", JwtExceptionCode.NOT_FOUND_TOKEN.getCode());
                    log.error("Token not found: {}", accessToken, e);

                    SecurityContextHolder.clearContext();

                    throw new BadCredentialsException("Token not found exception", e);
                }
            }

        filterChain.doFilter(request, response);

        }

        private Authentication getAuthentication (String token){
            Claims claims = jwtTokenizer.parseAccessToken(token);

            //토큰에서 가져온 데이터
            String email = claims.getSubject();
            Long userId = claims.get("userId", Long.class);
            List<GrantedAuthority> grantedAuthorities = getGrantedAuthority(claims);

            //userDetails
            CustomUserDetails customUserDetails = new CustomUserDetails("", email, userId, grantedAuthorities);

            return new JwtAuthenticationToken(grantedAuthorities, customUserDetails, null);

        }

        private List<GrantedAuthority> getGrantedAuthority (Claims claims){
            List<String> roles = (List<String>) claims.get("roles");

            return roles.stream()
                    .map(role -> {
                        // "ROLE_" 접두사가 없으면 붙여주고, 있으면 그대로 사용
                        if (role.startsWith("ROLE_")) {
                            return new SimpleGrantedAuthority(role);
                        } else {
                            return new SimpleGrantedAuthority("ROLE_" + role);
                        }
                    })
                    .collect(Collectors.toList());
        }



    public String getAccessToken(HttpServletRequest request){

        //쿠키에 있는지 확인
        Cookie[] cookies = request.getCookies();
        if(cookies!=null){
            for(Cookie cookie : cookies){
                if("accessToken".equals(cookie.getName())){
                    return cookie.getValue();
                }
            }
        }

        return null;
    }

    private String getRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName()))
                    return cookie.getValue();
            }
        }
        return null;
    }

    private void setCookies(String token, HttpServletResponse response){
        Claims claims = jwtTokenizer.parseRefreshToken(token);

        String email = claims.getSubject();
        Long userId = claims.get("userId", Long.class);
        String name = claims.get("username", String.class);
        List<String> roles = claims.get("roles", List.class);

        long maxAgeAccessInSeconds = jwtTokenizer.accessTokenExpirationMinutes / 1000;
        long maxAgeRefreshInSeconds = jwtTokenizer.refreshTokenExpirationMinutes / 1000;

        String newAccessToken = jwtTokenizer.createAccessToken(userId, email, name, roles.get(0));
        String newRefreshToken = jwtTokenizer.createRefreshToken(userId, email, name, roles.get(0));

        // 쿠키로 재전송
        Cookie newAccessTokenCookie = new Cookie("accessToken", newAccessToken);
        newAccessTokenCookie.setHttpOnly(true);
        newAccessTokenCookie.setPath("/");
        newAccessTokenCookie.setMaxAge(Math.toIntExact(maxAgeAccessInSeconds)); // 30분
        response.addCookie(newAccessTokenCookie);

        // 쿠키로 재전송
        Cookie newRefreshTokenCookie = new Cookie("refreshToken", newRefreshToken);
        newAccessTokenCookie.setHttpOnly(true);
        newAccessTokenCookie.setPath("/");
        newAccessTokenCookie.setMaxAge(Math.toIntExact(maxAgeRefreshInSeconds)); // 30분
        response.addCookie(newRefreshTokenCookie);

        redisService.saveRefreshToken(userId,newRefreshToken);

        // SecurityContext 갱신
        Authentication authentication = getAuthentication(newAccessToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    public void validRefreshToken(String refreshToken) {
        Claims claims = jwtTokenizer.parseRefreshToken(refreshToken);

        Long userId = claims.get("userId", Long.class);
        String savedRefreshToken = redisService.getRefreshToken(userId);

        if (savedRefreshToken == null || !refreshToken.equals(savedRefreshToken)) {
            throw new BusinessLogicException(ExceptionCode.INVALID_REFRESH_TOKEN);
        }
    }




}
