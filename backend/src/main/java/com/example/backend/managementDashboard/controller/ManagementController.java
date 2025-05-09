package com.example.backend.managementDashboard.controller;


import com.example.backend.user.dto.request.UserSignRequestDto;
import com.example.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/management")
@Validated
@AllArgsConstructor
public class ManagementController {

    private final UserService userService;

    @PostMapping
    @Operation(
            summary = "관리 페이지 생성",
            description = "일반 사용자(User)의 회원가입을 처리합니다."
    )
    public ResponseEntity signupUser(@Valid @RequestBody UserSignRequestDto userSignRequestDto) {
        //BoardEntity response = BoardService.createBoard(BoardMapper.boardDtoPostToBoard(post));

        // return new ResponseEntity<>(response, HttpStatus.CREATED);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }


}