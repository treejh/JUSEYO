package com.example.backend.item.dto.response;

public interface ItemSearchProjection {
    //비품 검색 결과 표시
    Long getId();
    String getName();
    String getCategoryName();
    Long getAvailableQuantity();
}

