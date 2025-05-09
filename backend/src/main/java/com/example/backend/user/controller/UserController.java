package com.example.backend.user.controller;



import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.dto.request.ManagerSignupRequestDto;
import com.example.backend.user.dto.request.UserLoginRequestDto;
import com.example.backend.user.dto.request.UserSignRequestDto;
import com.example.backend.user.entity.User;
import com.example.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
@Validated
@AllArgsConstructor
@Tag(name = "유저 관리 컨트롤러")
public class UserController {

    private final UserService userService;
    private final TokenService tokenService;

    @PostMapping("/signup")
    @Operation(
            summary = "회원 가입 (일반 사용자)",
            description = "일반 사용자(User)의 회원가입을 처리합니다."
    )
    public ResponseEntity signupUser(@Valid @RequestBody UserSignRequestDto userSignRequestDto) {
        userService.createUser(userSignRequestDto);

        return new ResponseEntity<>("일반 회원 생성 성공",HttpStatus.CREATED);
    }

    //Manager signup
    @PostMapping("/signup/manager")
    @Operation(
            summary = "회원 가입 (매니저)",
            description = "매니저(Manager)의 회원가입을 처리합니다."
    )
    public ResponseEntity signupManager(@Valid @RequestBody ManagerSignupRequestDto managerSignupRequestDto) {
        userService.createManager(managerSignupRequestDto);
        return new ResponseEntity<>("매니저 생성 성공", HttpStatus.CREATED);

    }


    @PostMapping("/login")
    public ResponseEntity login(@RequestBody UserLoginRequestDto userLoginRequestDto){
        User user = userService.findByEmail(userLoginRequestDto.getEmail());
        //비밀번호 일치하는지 확인
        userService.validPassword(userLoginRequestDto.getPassword(), user.getPassword());
        tokenService.makeCookies(user);

        return new ResponseEntity<>("로그인 성공", HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity login(){
        tokenService.deleteCookie("refreshToken");
        tokenService.deleteCookie("accessToken");
        return new ResponseEntity<>("로그아웃 성공", HttpStatus.OK);
    }




}