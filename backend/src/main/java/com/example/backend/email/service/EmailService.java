package com.example.backend.email.service;

import com.example.backend.email.entity.EmailMessage;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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

    private final SpringTemplateEngine templateEngine;


    public String sendMail(EmailMessage emailMessage, String type, String pw) {
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


    public String setContext(String code, String type) {
        Context context = new Context();
        context.setVariable("code", code);
        return templateEngine.process(type, context);
    }
}
