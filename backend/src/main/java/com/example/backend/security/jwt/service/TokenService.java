package com.example.backend.security.jwt.service;



import com.example.backend.enums.RoleType;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.role.entity.Role;
import com.example.backend.role.repository.RoleRepository;
import com.example.backend.security.jwt.util.JwtTokenizer;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final HttpServletRequest httpServletRequest;
    private final HttpServletResponse httpServletResponse;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtTokenizer jwtTokenizer;


    public String getTokenFromRequest() {

        //쿠키에 있는지 확인
        Cookie[] cookies = httpServletRequest.getCookies();
        if(cookies!=null){
            for(Cookie cookie : cookies){
                if("accessToken".equals(cookie.getName())){
                    return cookie.getValue();
                }
            }
        }
        return null;

    }

    public String getEmailFromToken(){
        String token = getTokenFromRequest();

        if (token == null) {
            throw new BusinessLogicException(ExceptionCode.TOKEN_NOT_FOUND);  // 토큰이 없으면 예외 처리
        }

        userRepository.findByEmail(jwtTokenizer.getEmailFromToken(token))
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));



        return jwtTokenizer.getEmailFromToken(token);
    }

    public Role getRoleFromToken(){
        String token = getTokenFromRequest();

        if (token == null) {
            throw new BusinessLogicException(ExceptionCode.TOKEN_NOT_FOUND);  // 토큰이 없으면 예외 처리
        }

        RoleType roleType = RoleType.valueOf(jwtTokenizer.getRoleFromToken(token)); // 문자열을 enum으로 변환

        return roleRepository.findByRole(roleType).orElseThrow(
                ()-> new BusinessLogicException(ExceptionCode.ROLE_NOT_FOUND)
        );
    }

    public Long getIdFromToken(){
        String token = getTokenFromRequest();

        if (token == null) {
            throw new BusinessLogicException(ExceptionCode.TOKEN_NOT_FOUND); // 토큰이 없으면 예외 처리
        }

        userRepository.findById(jwtTokenizer.getUserIdFromToken(token))
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));


        return jwtTokenizer.getUserIdFromToken(token);

    }

    public void makeCookies(User user) {
        long maxAgeAccessInSeconds = jwtTokenizer.accessTokenExpirationMinutes / 1000;
        long maxAgeRefreshInSeconds = jwtTokenizer.refreshTokenExpirationMinutes / 1000;
        String accessToken = jwtTokenizer.createAccessToken(user.getId(),user.getName()
                ,user.getEmail(),user.getRole().getRole().name());
        String refreshToken = jwtTokenizer.createRefreshToken(user.getId(),user.getName()
                ,user.getEmail(),user.getRole().getRole().name());

        Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(Math.toIntExact(maxAgeAccessInSeconds));  // 초 단위로 설정

        Cookie refreshTokenCookie = new Cookie("refreshToken",refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(Math.toIntExact(maxAgeRefreshInSeconds));


        httpServletResponse.addCookie(accessTokenCookie);
        httpServletResponse.addCookie(refreshTokenCookie);
    }

    public void setCookie(String name, String value) {
        long maxAgeInSeconds = jwtTokenizer.accessTokenExpirationMinutes / 1000;
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .path("/")
                .sameSite("Strict")
                .secure(true)
                .httpOnly(true)
                .maxAge(Math.toIntExact(maxAgeInSeconds))
                .build();

        httpServletResponse.addHeader("Set-Cookie", cookie.toString());
    }

    public void setCookieHttps(String name, String value,String domain) {
        long maxAgeInSeconds = jwtTokenizer.accessTokenExpirationMinutes / 1000;
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .path("/")
                .domain(domain) // 백엔드의 도메인 주소로 설정
                .sameSite("Strict")
                .secure(true)
                .httpOnly(true)
                .maxAge(Math.toIntExact(maxAgeInSeconds))
                .build();

        httpServletResponse.addHeader("Set-Cookie", cookie.toString());
    }





    public void deleteCookie(String name) {
        ResponseCookie cookie = ResponseCookie.from(name, null)
                .path("/")
                .sameSite("Strict")
                .secure(true)
                .httpOnly(true)
                .maxAge(0)
                .build();

        httpServletResponse.addHeader("Set-Cookie", cookie.toString());
    }

    public boolean validateToken(String token) {
        return jwtTokenizer.validateToken(token);
    }



}
