package com.example.backend.domain.managementDashboard.service;

import com.example.backend.global.config.NtsApiConfig;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.managementDashboard.repository.ManagementDashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BizInfoService {

    private final RestTemplate restTemplate;
    private final NtsApiConfig ntsApiConfig;
    private final ManagementDashboardRepository managementDashboardRepository;

    public Map<String, Object> checkBusinessExistence(String businessNumber) {
        if (checkBusinessStatus(businessNumber)) {
            throw new BusinessLogicException(ExceptionCode.ALREADY_HAS_BUSINESSREGISTRATIONNUMBER); //에러코드 나중에 바꾸기
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("b_no", List.of(businessNumber));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        String fullUrl = ntsApiConfig.getBaseUrl() + "?serviceKey=" + URLEncoder.encode(ntsApiConfig.getServiceKey(), StandardCharsets.UTF_8);
        URI uri = URI.create(fullUrl);

        ResponseEntity<Map> response = restTemplate.exchange(
                uri,
                HttpMethod.POST,
                request,
                Map.class
        );

        return response.getBody();
    }

    public boolean checkBusinessStatus(String businessNumber) {
        return managementDashboardRepository.findByBusinessRegistrationNumber(businessNumber).isPresent();
    }


}

