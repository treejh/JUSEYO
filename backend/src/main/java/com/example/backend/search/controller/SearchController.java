package com.example.backend.search.controller;

import com.example.backend.item.dto.response.ItemSearchProjection;
import com.example.backend.item.service.ItemService;
import com.example.backend.user.dto.response.UserSearchProjection;
import com.example.backend.user.service.UserService;
import com.example.backend.utils.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Tag(name = "검색 API", description = "비품 및 회원 검색을 위한 API")
public class SearchController {

    private final ItemService itemService;
    private final UserService userService;

    //비품 검색
    @Operation(summary = "비품 검색", description = "관리 페이지 내의 비품을 키워드로 검색합니다.")
    @GetMapping("/items")
    public ResponseEntity<ApiResponse<Page<ItemSearchProjection>>> searchItems(
            @Parameter(description = "관리 페이지 ID", example = "1")
            @RequestParam(name = "managementDashboardId")
            Long managementDashboardId,

            @Parameter(description = "검색 키워드", example = "노트북")
            @RequestParam(name = "keyword")
            String keyword,

            @ParameterObject
            Pageable pageable) {

        Page<ItemSearchProjection> page = itemService.findItemsByKeyword(managementDashboardId, keyword, pageable);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK.value(), "검색 성공", page));
    }

    //회원 검색
    @Operation(summary = "회원 검색", description = "관리 페이지 안의 회원을 키워드로 검색합니다.")
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserSearchProjection>>> searchUsers(
            @RequestParam(name = "managementDashboardId", required = true)
            Long managementDashboardId,

            @RequestParam(name = "keyword", required = true)
            String keyword,

            @ParameterObject
            Pageable pageable
    ) {
        Page<UserSearchProjection> page =
                userService.searchUsers(managementDashboardId, keyword, pageable);

        return ResponseEntity.ok(
                ApiResponse.of(200, "검색 성공", page)
        );
    }

}
