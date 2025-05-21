package com.example.backend.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


@Component
public class NtsApiConfig {

    @Value("${api.nts.service-key}")
    private String serviceKey;

    public String getServiceKey() {
        return serviceKey;
    }

    public String getBaseUrl() {
        return "https://api.odcloud.kr/api/nts-businessman/v1/status";
    }
}
