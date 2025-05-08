package com.example.backend.base.controller;


import com.example.demo.dto.BoardDto;
import com.example.demo.entity.BoardEntity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import com.example.demo.mapper.BoardMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.example.demo.service.BoardService;

@RestController
@RequestMapping("/board")
@Validated
@AllArgsConstructor
public class BaseController {

    private final BoardService BoardService;
    private final BoardMapper BoardMapper;

    // Create
    @PostMapping
    public ResponseEntity postMember(@Valid @RequestBody BoardDto.Post post) {
        //BoardEntity response = BoardService.createBoard(BoardMapper.boardDtoPostToBoard(post));

        // return new ResponseEntity<>(response, HttpStatus.CREATED);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    // Read
    @GetMapping
    public ResponseEntity getMember(@Positive @RequestParam long memberId) {
        return new ResponseEntity<>(HttpStatus.OK);
    }

    // Update
    @PatchMapping
    public ResponseEntity patchMember(@RequestBody BoardDto.Patch patch) {

        return new ResponseEntity<>( HttpStatus.OK);
    }

    // Delete
    @DeleteMapping
    public ResponseEntity deleteBoard(@Positive @RequestParam long ProjectId) {
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}