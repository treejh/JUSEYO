package com.example.backend.security.jwt.util;

import com.example.backend.enums.RoleType;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


@Component
public class JwtTokenizer {

    private final byte [] accessSecret;
    private final byte [] refreshSecret;
    public final Long refreshTokenExpirationMinutes;
    public final Long accessTokenExpirationMinutes;

    //야물 파일에 있는 데이터를 가지고 온다.
    public JwtTokenizer(@Value("${jwt.secretKey}") String accessSecret, @Value("${jwt.refreshKey}") String refreshSecret,
                        @Value("${jwt.refresh-token-expire-time}") Long refreshTokenExpirationMinutes,
                        @Value("${jwt.access-token-expire-time}") Long accessTokenExpirationMinutes) {
        this.accessSecret = accessSecret.getBytes(StandardCharsets.UTF_8);
        this.refreshSecret = refreshSecret.getBytes(StandardCharsets.UTF_8);
        this.refreshTokenExpirationMinutes = refreshTokenExpirationMinutes;
        this.accessTokenExpirationMinutes=accessTokenExpirationMinutes;

    }


    //토큰은 인증에 대한 정보만 들어가게 하고, 비밀번호는 넣지 않는다(보안 문제 상 ) 불필요한 애들은 빼도 괜춘 ㅇㅇ
    private String createToken(Long id, String email, String username, String role,
                               Long expire, byte[] secretKey){
       //필요한 정보들을 저장한다.
        //고유한 식별자 값이 subject에 들어가는게 좋다 (이메일 중복 안될테니 걍 이메일 넣은거임)
        Claims claims = Jwts.claims()
                .setSubject(email);

        //토큰을 만들어서 클라이언트한테 보낼때 포함될 값들을 저장하고 있는걱임ㅇ ㅇㅇ

        claims.put("username",username);
        claims.put("userId",id);
        claims.put("roles", List.of(role));


        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + expire))//만료시간 : , 현재 시간 + expire 더한값 -> 언제까지 사용할지
                .signWith(getSigningKey(secretKey))
                .compact();
    }

    //값을 꺼내려고 하니 토큰, 시크릿키를 추가할 수 있는 메서드 만듬
    public Claims parseAccessToken(String accessToken){
        return parseToken(accessToken,accessSecret);
    }

    public Claims parseRefreshToken(String refreshToken){
        return parseToken(refreshToken,refreshSecret);

    }

    private static Key getSigningKey(byte[] secretKey){
        return Keys.hmacShaKeyFor(secretKey);
    }

    public String createAccessToken(Long id, String email,String name, String role){
        return createToken(id,email,name,role, accessTokenExpirationMinutes,accessSecret);
    }

    public String createRefreshToken(Long id, String email, String username, String role){
        return createToken(id,email,username,role,refreshTokenExpirationMinutes,refreshSecret);
    }


    //받은 토큰에서 데이터 받는 메서드
    public Claims parseToken(String token, byte[] secretKey){

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey(secretKey))
                .build()
                .parseClaimsJws(token)
                .getBody();

        // 만료 시간 체크
        checkTokenExpiration(claims);

        return claims;

    }
    private void checkTokenExpiration(Claims claims) {
        Date expiration = claims.getExpiration();
//        System.out.println("현재시간 확인!!: " + new Date());
//        System.out.println("만료시간 확인 !!!  "+ expiration);
        if (expiration != null && expiration.before(new Date())) {
            throw new IllegalArgumentException("토큰이 만료되었습니다.");
        }
    }



    public String getEmailFromToken(String token){
        if(token == null || token.isBlank()){
            throw new BusinessLogicException(ExceptionCode.TOKEN_NOT_FOUND);
        }


        Claims claims = parseToken(token, accessSecret);

        if(claims == null){
            throw new IllegalArgumentException("유효하지 않은 형식입니다.");
        }

        Object email = claims.get("email");


        if(email instanceof String){
            return ((String)email);
        }else{
            throw new IllegalArgumentException("JWT토큰에서 email를 찾을 수 없습니다.");
        }

    }

    public String getRoleFromToken(String token){
        if(token == null || token.isBlank()){
            throw new BusinessLogicException(ExceptionCode.TOKEN_NOT_FOUND);
        }


        Claims claims = parseToken(token, accessSecret);

        if(claims == null){
            throw new IllegalArgumentException("유효하지 않은 형식입니다.");
        }

        Object roles = claims.get("roles");

        if (roles instanceof List<?> roleList && !roleList.isEmpty()) {
            return roleList.get(0).toString();
        } else {
            throw new IllegalArgumentException("JWT토큰에서 roles를 찾을 수 없습니다.");
        }


    }


    public Long getUserIdFromToken(String token){
        if(token == null || token.isBlank()){
            throw new BusinessLogicException(ExceptionCode.TOKEN_NOT_FOUND);
        }

        Claims claims = parseToken(token, accessSecret);

        if(claims == null){
            throw new IllegalArgumentException("유효하지 않은 형식입니다.");
        }
        Object userId = claims.get("userId");
        if(userId instanceof Number){
            return ((Number)userId).longValue();
        }else{
            throw new IllegalArgumentException("JWT토큰에서 userId를 찾을 수 없습니다.");
        }

    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(accessSecret).parseClaimsJws(token); // 유효한 JWT인지 확인
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false; // 예외 발생 시 토큰이 유효하지 않음
        }
    }




}
