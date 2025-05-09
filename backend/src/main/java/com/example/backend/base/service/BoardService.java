package com.example.backend.base.service;



import com.example.backend.base.entity.BoardEntity;
import com.example.backend.base.repository.BoardRepository;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.security.jwt.service.TokenService;
import java.util.Optional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class BoardService {

        private final BoardRepository boardRepository;


        //Create
        public BoardEntity createBoard(BoardEntity board) {
            return boardRepository.save(board);
        }

        public BoardEntity findBoard(long projectId) {
            BoardEntity board = verifiedBoard(projectId);
            return board;
        }

    public BoardEntity verifiedBoard(long projectId) {
        Optional<BoardEntity> board = boardRepository.findById(projectId);
        return board.orElseThrow(() -> new BusinessLogicException(ExceptionCode.BOARD_NOT_FOUND));
    }

        // Update
        public BoardEntity updateBoard(BoardEntity board) {
            BoardEntity findBoard = verifiedBoard(board.getProjectId());
            Optional.ofNullable(board.getMemberId()).ifPresent(findBoard::setMemberId);
            Optional.ofNullable(board.getRecruitmentSize()).ifPresent(findBoard::setRecruitmentSize);
            Optional.ofNullable(board.getTitle()).ifPresent(findBoard::setTitle);
            Optional.ofNullable(board.getBoardContent()).ifPresent(findBoard::setBoardContent);
            Optional.ofNullable(board.getBoardGoal()).ifPresent(findBoard::setBoardGoal);
            Optional.ofNullable(board.getBoardPartner()).ifPresent(findBoard::setBoardPartner);
            Optional.ofNullable(board.getRecruitmentPeriod()).ifPresent(findBoard::setRecruitmentPeriod);
            Optional.ofNullable(board.getExpectedDuration()).ifPresent(findBoard::setExpectedDuration);

            return boardRepository.save(findBoard);
        }

        // Delete
        public void deleteBoard(long ProjectId) {
            BoardEntity board = verifiedBoard(ProjectId);
            boardRepository.delete(board);
        }

        // 멤버 검증

    }