package com.example.backend.global.security.config;




import com.example.backend.global.redis.RedisService;
import com.example.backend.global.security.jwt.filter.JwtAuthenticationFilter;
import com.example.backend.global.security.jwt.filter.UserStatusCheckFilter;
import com.example.backend.global.security.jwt.util.JwtTokenizer;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfigJuseyo {

    private final JwtTokenizer jwtTokenizer;
    private final UserStatusCheckFilter userStatusCheckFilter;
    private final RedisService redisService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/api/v1/admin/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/biz/check").permitAll()
                        //핸드폰
                        .requestMatchers(HttpMethod.POST, "/api/v1/sms/**").permitAll()
                        //채팅
                        .requestMatchers( "/api/v1/users/chat/list/**","/api/v1/users/chat/**").hasAnyRole("MANAGER", "USER","ADMIN")
                        //회원
                        .requestMatchers(HttpMethod.POST, "/api/v1/users/signup/**","/api/v1/users/login","/api/v1/users/emails/findPassword","/api/v1/users/emails/**","/api/v1/users/duplication/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/approve","/api/v1/users/request","/api/v1/users/approve/**","/api/v1/users/reject/**")
                        .hasAnyAuthority("ROLE_MANAGER", "ROLE_ADMIN")
                        //비품
                        .requestMatchers(HttpMethod.PUT, "/api/v1/items/**").hasRole("MANAGER") // 비품수정은 매니저만 가능
                        //부서
                        .requestMatchers(HttpMethod.POST, "/api/v1/departments/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/departments/**").hasAnyRole("MANAGER", "USER")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/departments/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/departments/**").hasRole("MANAGER")

                        // 알림 관련 설정
                        .requestMatchers(HttpMethod.POST, "/api/v1/notifications/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/notifications/stream/**").authenticated()

                        //비품 등룩(구매)
                        .requestMatchers("/api/v1/register-items/**").hasAnyRole("MANAGER", "ADMIN")
                        //비품 반납
                        .requestMatchers("/api/v1/supply-return/**").hasAnyRole("MANAGER", "ADMIN","USER")
                        .requestMatchers(HttpMethod.POST,"/api/v1/supply-return/{id}").hasAnyRole("MANAGER", "ADMIN") //반납서 상태 변경
                        //입고
                        .requestMatchers("/api/v1/inventory-in/**").hasAnyRole("MANAGER", "ADMIN")

                        // 카테고리
                        .requestMatchers(HttpMethod.GET,    "/api/v1/categories/**").hasAnyRole("USER","MANAGER","ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/v1/categories/**").hasAnyRole("MANAGER","ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/categories/**").hasAnyRole("MANAGER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/categories/**").hasAnyRole("MANAGER","ADMIN")

                        // 검색
                        .requestMatchers(HttpMethod.GET, "/api/v1/search/items").hasAnyRole("MANAGER", "USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/search/users").hasAnyRole("MANAGER", "USER", "ADMIN")

                        // 비품 요청
                        .requestMatchers(HttpMethod.GET,  "/api/v1/supply-requests/**").hasAnyRole("USER","MANAGER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/supply-requests").hasAnyRole("USER","MANAGER","ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(userStatusCheckFilter, UsernamePasswordAuthenticationFilter.class) // UserStatusCheckFilter 추가
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenizer,redisService), UsernamePasswordAuthenticationFilter.class)

                .formLogin(form -> form.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrf -> csrf.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .cors(cors -> cors.configurationSource(configurationSource()))
                .logout(logout -> logout
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID"));


        return http.build();
    }








    //특정 포트 번호 허락
    public CorsConfigurationSource configurationSource(){
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:3000"
        ));

        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);

        source.registerCorsConfiguration("/**", config);
        return source;
    }




    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }


}