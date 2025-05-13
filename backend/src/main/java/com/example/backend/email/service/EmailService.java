package com.example.backend.email.service;

import com.example.backend.email.entity.EmailMessage;
//import com.example.backend.redis.RedisService;
import com.example.backend.redis.RedisService;
import com.example.backend.utils.CreateRandomNumber;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    @Autowired
    @Qualifier("gmailMailSender") // Gmail로 보내고 싶을 때
    private JavaMailSender gmailSender;

    @Value("${custom-mail.auth-code-expiration-millis}")
    private long authCodeExpirationMillis;

    private final SpringTemplateEngine templateEngine;
    private final RedisService redisService;
    private static final String AUTH_CODE_PREFIX = "certification:email:";



    //임시 비밀번호 전송 메서드
    public String sendPassword(EmailMessage emailMessage, String type, String pw) {
        JavaMailSender mailSender = gmailSender;

        MimeMessage mimeMessage = mailSender.createMimeMessage();


        try {
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            mimeMessageHelper.setTo(emailMessage.getTo());
            mimeMessageHelper.setSubject(emailMessage.getSubject());
            mimeMessageHelper.setText(setContext(pw, type), true);
            mailSender.send(mimeMessage);

            log.info("Success");
            return pw;

        } catch (MessagingException e) {
            log.info("fail");
            throw new RuntimeException(e);
        }
    }

    //인증번호 전송 메서드
    public String sendCertificationNumber(EmailMessage emailMessage, String type) {
        JavaMailSender mailSender = gmailSender;

        String certificationNumber = CreateRandomNumber.randomNumber();

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        redisService.saveData(AUTH_CODE_PREFIX + emailMessage.getTo(),
                certificationNumber, Duration.ofMillis(this.authCodeExpirationMillis));

        try {
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            mimeMessageHelper.setTo(emailMessage.getTo());
            mimeMessageHelper.setSubject(emailMessage.getSubject());
            mimeMessageHelper.setText(setContext(certificationNumber, type), true);
            mailSender.send(mimeMessage);

            log.info("Success");
            return certificationNumber;

        } catch (MessagingException e) {
            log.info("fail");
            throw new RuntimeException(e);
        }

    }

    public boolean verifiedCode(String email, String authCode) {
        String redisAuthCode = redisService.getData(AUTH_CODE_PREFIX + email);
        return redisAuthCode != null && redisAuthCode.equals(authCode);
    }





    public String setContext(String code, String type) {
        Context context = new Context();
        context.setVariable("code", code);
        return templateEngine.process(type, context);
    }
}
