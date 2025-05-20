package com.example.backend.sms.controller;

import com.example.backend.sms.dto.PhoneVerificationRequest;
import com.example.backend.sms.dto.SmsRequestDto;
import com.example.backend.sms.service.SmsService;
import com.example.backend.user.dto.request.EmailRequestDto;
import com.example.backend.user.dto.request.EmailVerificationRequest;
import com.example.backend.utils.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/sms")
@Tag(name = "SMS 인증 API", description = "휴대폰 문자 인증번호 전송 및 인증")
public class SmsController {

    private final SmsService smsService;

    @PostMapping("/certificationNumber")
    @Operation(
            summary = "핸드폰으로 인증번호 전송",
            description = "사용자의 휴대폰 번호로 인증번호를 전송합니다."
    )
    public ResponseEntity sendCertificationNumberPhone(@Valid @RequestBody SmsRequestDto smsRequestDto) {
        smsService.sendVerificationCode(smsRequestDto.getPhoneNumber().replaceAll("-", ""));
        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "핸드폰으로 인증번호 전송 완료 "),
                HttpStatus.OK
        );
    }



    @PostMapping("/verification")
    @Operation(
            summary = "핸드폰 인증번호 검증",
            description = "사용자가 입력한 인증코드를 확인하여 핸드폰 인증을 진행합니다. 인증번호가 유효한 경우 인증이 완료됩니다."
    )
    public ResponseEntity phoneCertificationNumberValid(@Valid @RequestBody PhoneVerificationRequest phoneVerificationRequest) {
        boolean valid = smsService.verifiedCode(phoneVerificationRequest.getPhoneNumber().replaceAll("-", ""), phoneVerificationRequest.getAuthCode());

        if (valid) {
            return new ResponseEntity<>(
                    ApiResponse.of(HttpStatus.OK.value(), "핸드폰 번호 인증 성공 (인증 번호 인증 성공) "),
                    HttpStatus.OK
            );
        } else {
            return new ResponseEntity<>(
                    ApiResponse.of(HttpStatus.UNAUTHORIZED.value(), "핸드폰 번호 인증 실패 (인증 번호 인증 실패) "),
                    HttpStatus.UNAUTHORIZED
            );
        }
    }
}