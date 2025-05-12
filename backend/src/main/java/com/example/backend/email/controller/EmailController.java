package com.example.backend.email.controller;


import com.example.backend.email.entity.EmailMessage;
import com.example.backend.email.service.EmailService;
import com.example.backend.user.dto.request.EmailRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RequestMapping("/api/v1/emails")
@RestController
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;


	// 임시 비밀번호 발급 테스트 (테스트 용이라 사용 안함)
    @PostMapping("/test/sendPassword")
    public ResponseEntity sendPasswordMail(@RequestBody EmailRequestDto findPwToEmail) {
        EmailMessage emailMessage = EmailMessage.builder()
                .to(findPwToEmail.getEmail())
                .subject("[Juseyo] 임시 비밀번호 발급")
                .build();

        emailService.sendPassword(emailMessage, "password","hihi");

        return ResponseEntity.ok().build();
    }


    //인증번호 발급
    @PostMapping("/test/certificationNumber")
    public ResponseEntity sendCertificationNumberMail(@RequestBody EmailRequestDto emailRequestDto) {
        EmailMessage emailMessage = EmailMessage.builder()
                .to(emailRequestDto.getEmail())
                .subject("[Juseyo] 인증번호 발급")
                .build();

        emailService.sendCertificationNumber(emailMessage, "certificationNumber");

        return ResponseEntity.ok().build();
    }


}