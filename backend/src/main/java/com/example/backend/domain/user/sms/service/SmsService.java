package com.example.backend.domain.user.sms.service;

import com.example.backend.global.redis.RedisService;
import com.example.backend.global.utils.CreateRandomNumber;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.exception.NurigoEmptyResponseException;
import net.nurigo.sdk.message.exception.NurigoMessageNotReceivedException;
import net.nurigo.sdk.message.exception.NurigoUnknownException;
import net.nurigo.sdk.message.service.DefaultMessageService;
import net.nurigo.sdk.message.model.Message;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;


import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final RedisService redisService;

    @Value("${nurigo.api-key}")
    private String apiKey;

    @Value("${nurigo.secret-key}")
    private String secretKey;

    @Value("${nurigo.sender-phone}")
    private String senderPhone;

    @Value("${nurigo.auth-code-expiration-millis}")
    private long authNurigoCodeExpirationMillis;

    private static final String AUTH_CODE_PREFIX = "certification:phone:";

    private DefaultMessageService messageService;

    @PostConstruct
    public void init() {
        this.messageService = NurigoApp.INSTANCE.initialize(apiKey, secretKey, "https://api.coolsms.co.kr");
    }
    public void sendVerificationCode(String phoneNumber) {
        String code = CreateRandomNumber.randomNumberSix();


        redisService.saveData(AUTH_CODE_PREFIX + phoneNumber,
                code, Duration.ofMillis(authNurigoCodeExpirationMillis));

        Message message = new Message();
        message.setFrom(senderPhone);
        message.setTo(phoneNumber);
        message.setText("[Juseyo] 인증번호 [" + code + "] 를 입력해주세요.");

        try {
            messageService.send(message);
        } catch (NurigoMessageNotReceivedException e) {
            throw new RuntimeException("문자 전송 실패: 메시지를 받지 못함", e);
        } catch (NurigoEmptyResponseException e) {
            throw new RuntimeException("문자 전송 실패: 응답 없음", e);
        } catch (NurigoUnknownException e) {
            throw new  RuntimeException("문자 전송 실패: 알 수 없는 오류", e);
        }
    }

    public boolean verifiedCode(String phone, String authCode) {
        String redisAuthCode = redisService.getData(AUTH_CODE_PREFIX + phone);
        return redisAuthCode != null && redisAuthCode.equals(authCode);
    }


}