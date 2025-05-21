package com.example.backend.domain.recommendation.service;

import com.example.backend.domain.Inventory.inventoryOut.repository.InventoryOutRepository;
import com.example.backend.domain.recommendation.dto.OutHistoryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OutHistoryService {

    private final InventoryOutRepository outRepo;

    public List<OutHistoryDto> getAllOutHistory() {
        return outRepo.findAll().stream()
                .map(out -> new OutHistoryDto(
                        out.getSupplyRequest().getUser().getId(), // 요청자 ID
                        out.getItem().getName()
                ))
                .toList();
    }
}

