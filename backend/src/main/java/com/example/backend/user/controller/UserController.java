package com.example.backend.user.controller;



import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.managementDashboard.service.ManagementDashboardService;
import com.example.backend.role.entity.Role;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.dto.request.InitialManagerSignupRequestDto;
import com.example.backend.user.dto.request.ManagerSignupRequestDto;
import com.example.backend.user.dto.request.UserLoginRequestDto;
import com.example.backend.user.dto.request.UserSignRequestDto;
import com.example.backend.user.dto.response.ApproveUserListForInitialManagerResponseDto;
import com.example.backend.user.dto.response.ApproveUserListForManagerResponseDto;
import com.example.backend.user.entity.User;
import com.example.backend.user.service.UserService;
import com.example.backend.utils.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@Validated
@AllArgsConstructor
@Tag(name = "유저 관리 컨트롤러")
@Slf4j
public class UserController {

    private final UserService userService;
    private final TokenService tokenService;
    private final ManagementDashboardService managementDashboardService;



    @PostMapping("/signup")
    @Operation(
            summary = "회원 가입 (일반 사용자)",
            description = "일반 사용자(User)의 회원가입을 처리합니다."
    )
    public ResponseEntity signupUser(@Valid @RequestBody UserSignRequestDto userSignRequestDto) {
        userService.createUser(userSignRequestDto);

        return new ResponseEntity<>("일반 회원 생성 성공",HttpStatus.CREATED);
    }



    @GetMapping("/approve")
    @Operation(
            summary = "해당 관리 페이지 사용이 승인된 유저",
            description = "해당 관리 페이지 사용이 승인된 유저 리스트를 조회할 수 있습니다."
    )
    public ResponseEntity<?> getApproveUser(@RequestParam String managementDashboardName
                                                 ,@RequestParam(name = "page", defaultValue = "1") int page,
                                                    @RequestParam(name="size", defaultValue = "10") int size) {
        // dashboardName으로 필터링 등 필요한 로직 수행 가능
        Page<User> approveUserList = userService.getApprovedList(managementDashboardName,
                PageRequest.of(page -1, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        //현재 로그인한 유저가 최초 매니저인지, 일반 매너지인지에 따라 제공하는 정보를 다르게 하기 위한 코드
        ManagementDashboard dashboard = managementDashboardService.findByPageName(managementDashboardName);
        Page<?> responseList;
        if (userService.isInitialManager(dashboard)) {
            responseList = approveUserList.map(ApproveUserListForInitialManagerResponseDto::new);
        } else {
            responseList = approveUserList.map(ApproveUserListForManagerResponseDto::new);
        }
        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "조회 성공", responseList),
                HttpStatus.OK
        );

    }


    @GetMapping("/request")
    @Operation(
            summary = "해당 관리 페이지 사용을 요청한 유저 ",
            description = "해당 관리 페이지 사용을 요청한 유저 리스트를 조회할 수 있습니다."
    )
    public ResponseEntity<?> getRequestUser(@RequestParam String managementDashboardName
                                        ,@RequestParam(name = "page", defaultValue = "1") int page,
                                         @RequestParam(name="size", defaultValue = "10") int size) {

        // dashboardName으로 필터링 등 필요한 로직 수행 가능
        Page<User> approveUserList = userService.getRequestList(managementDashboardName,
                PageRequest.of(page -1, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        //현재 로그인한 유저가 최초 매니저인지, 일반 매너지인지에 따라 제공하는 정보를 다르게 하기 위한 코드
        ManagementDashboard dashboard = managementDashboardService.findByPageName(managementDashboardName);
        Page<?> responseList;
        if (userService.isInitialManager(dashboard)) {
            responseList = approveUserList.map(ApproveUserListForInitialManagerResponseDto::new);
        } else {
            responseList = approveUserList.map(ApproveUserListForManagerResponseDto::new);
        }

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "조회 성공", responseList),
                HttpStatus.OK
        );

    }

    @GetMapping("/reject")
    @Operation(
            summary = "해당 관리 페이지 사용이 거부된 유저  ",
            description = "해당 관리 페이지 사용이 거부된 유저 리스트를 조회할 수 있습니다."
    )
    public ResponseEntity<?> getRejectUser(@RequestParam String managementDashboardName
            ,@RequestParam(name = "page", defaultValue = "1") int page,
                                            @RequestParam(name="size", defaultValue = "10") int size) {

        // dashboardName으로 필터링 등 필요한 로직 수행 가능
        Page<User> approveUserList = userService.getRejectList(managementDashboardName,
                PageRequest.of(page -1, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        //현재 로그인한 유저가 최초 매니저인지, 일반 매너지인지에 따라 제공하는 정보를 다르게 하기 위한 코드
        ManagementDashboard dashboard = managementDashboardService.findByPageName(managementDashboardName);
        Page<?> responseList;
        if (userService.isInitialManager(dashboard)) {
            responseList = approveUserList.map(ApproveUserListForInitialManagerResponseDto::new);
        } else {
            responseList = approveUserList.map(ApproveUserListForManagerResponseDto::new);
        }

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "조회 성공", responseList),
                HttpStatus.OK
        );

    }


    @PostMapping("/approve/{userId}")
    @Operation(
            summary = "매니저가 유저가 관리페이지를 사용할 수 있도록 승인",
            description = "매니저는 특정 유저를 관리페이지를 사용할 수 있도록 승인할 수 있습니다. "
    )
    public ResponseEntity<?> approveUserAccess(@PathVariable Long userId) {
        userService.approveUser(userId);

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "접근 권한이 승인되었습니다."),
                HttpStatus.OK
        );
    }

    @PostMapping("/reject/{userId}")
    @Operation(
            summary = "매니저가 특정 유저의 요청을 거부",
            description = "매니저는 특정 유저를 관리페이지를 사용을 거부할 수 있습니다. "
    )
    public ResponseEntity<?> rejectUserAccess(@PathVariable Long userId) {

        userService.rejectUser(userId);

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "접근 권한이 거부되었습니다."),
                HttpStatus.OK
        );

    }





    //Initial Manager signup
    @PostMapping("/signup/manager/initial")
    @Operation(
            summary = "회원 가입 (최초 매니저)",
            description = "최초 매니저(Initial Manager)의 회원가입을 처리합니다."
    )
    public ResponseEntity signupInitialManager(@Valid @RequestBody InitialManagerSignupRequestDto initialManagerSignupRequestDto) {
        userService.createInitialManager(initialManagerSignupRequestDto);
        return new ResponseEntity<>("매니저 생성 성공", HttpStatus.CREATED);


    }

    //Manager signup
    @PostMapping("/signup/manager")
    @Operation(
            summary = "회원 가입 (일반 매니저)",
            description = "일반 매니저(Initial Manager)의 회원가입을 처리합니다."
    )
    public ResponseEntity signupManager(@Valid @RequestBody ManagerSignupRequestDto managerSignupRequestDto) {
        userService.createManager(managerSignupRequestDto);
        return new ResponseEntity<>("매니저 생성 성공", HttpStatus.CREATED);

    }

    @PostMapping("/findPassword")
    @Operation(
            summary = "비밀번호 찾기",
            description = "비밀번호를 업데이트 한 후 결과를 반환"
    )
    public ResponseEntity<ApiResponse<String>> findPassword(@RequestParam String email) {
        // 비밀번호 찾기 로직을 수행하고, 해당 결과를 response로 반환
        String response = userService.findPassword(email);

        // 비밀번호 찾기 성공 메시지와 데이터를 포함하는 ApiResponse 생성
        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "비밀번호 재설정 ", response),
                HttpStatus.OK
        );
    }



    @PostMapping("/login")
    @Operation(
            summary = "로그인",
            description = "로그인을 처리합니다."
    )
    public ResponseEntity login(@RequestBody UserLoginRequestDto userLoginRequestDto){
        User user = userService.findByEmail(userLoginRequestDto.getEmail());
        //비밀번호 일치하는지 확인
        userService.validPassword(userLoginRequestDto.getPassword(), user.getPassword());
        tokenService.makeCookies(user);

        return new ResponseEntity<>("로그인 성공", HttpStatus.OK);
    }

    @PostMapping("/logout")
    @Operation(
            summary = "로그아웃",
            description = "로그아웃을 처리합니다."
    )
    public ResponseEntity login(){

        Role role = tokenService.getRoleFromToken();
        String name = role.getRole().name();
        log.info("역할 잘 들어오는지 확인 " + name);
        tokenService.deleteCookie("refreshToken");
        tokenService.deleteCookie("accessToken");
        return new ResponseEntity<>("로그아웃 성공", HttpStatus.OK);
    }









}