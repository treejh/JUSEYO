package com.example.backend.domain.recommendation.service;

import com.example.backend.domain.inventory.inventoryOut.repository.InventoryOutRepository;
import com.example.backend.domain.recommendation.dto.OutHistoryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

    private final OutHistoryService outHistoryService; // 출고 이력 가져오는 서비스
    private final RestTemplate restTemplate = new RestTemplate();
    private final InventoryOutRepository inventoryOutRepository;

    @Value("${recommend.flask-url}")
    private String flaskUrl;


    public List<String> getRecommendedItems(Long userId) {
        // 1. 출고 이력 가져오기
        List<OutHistoryDto> history = outHistoryService.getAllOutHistory();

        // 2. Flask에 보낼 요청 구성
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<List<OutHistoryDto>> request = new HttpEntity<>(history, headers);
        String url = flaskUrl +"recommend?userId=" + userId;

        // 3. Flask 서버에 POST 요청
        ResponseEntity<List> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                List.class
        );

        // 4. 추천 품목 리스트 반환
        return response.getBody();
    }

    public List<String> getAssociationRecommendations(String baseItem) {
        List<OutHistoryDto> history = inventoryOutRepository.findUserItemHistory();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<List<OutHistoryDto>> request = new HttpEntity<>(history, headers);
        String url = flaskUrl + "recommend/association?itemName=" + baseItem;


        ResponseEntity<List> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                List.class
        );

        return response.getBody();
    }
}

