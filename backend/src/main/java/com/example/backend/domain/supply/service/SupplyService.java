package com.example.backend.domain.supply.service;

import com.example.backend.domain.supply.supplyRequest.repository.SupplyRequestRepository;
import com.example.backend.domain.supply.supplyReturn.repository.SupplyReturnRepository;
import com.example.backend.enums.ApprovalStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SupplyService {
    private final SupplyReturnRepository supplyReturnRepository;
    private final SupplyRequestRepository supplyRequestRepository;

    public Map<ApprovalStatus, Long> getTotalSupplyCountsByApprovalStatus(Long userId) {
        List<Object[]> requestResults = supplyReturnRepository.countByApprovalStatusByUserId(userId);
        List<Object[]> returnResults = supplyRequestRepository.countByApprovalStatusByUserId(userId);

        Map<ApprovalStatus, Long> countMap = new HashMap<>();

        // SupplyRequest 결과 합산
        for (Object[] result : requestResults) {
            ApprovalStatus status = (ApprovalStatus) result[0];
            Long count = (Long) result[1];
            countMap.put(status, count);
        }

        // SupplyReturn 결과 합산
        for (Object[] result : returnResults) {
            ApprovalStatus status = (ApprovalStatus) result[0];
            Long count = (Long) result[1];
            countMap.merge(status, count, Long::sum); // 기존 값에 더함
        }

        return countMap;
    }







}
