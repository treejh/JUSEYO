package com.example.backend.user.controller;



import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.managementDashboard.service.ManagementDashboardService;
import com.example.backend.role.entity.Role;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.dto.request.AdminSignupRequestDto;
import com.example.backend.user.dto.request.InitialManagerSignupRequestDto;
import com.example.backend.user.dto.request.ManagerSignupRequestDto;
import com.example.backend.user.dto.request.UserLoginRequestDto;
import com.example.backend.user.dto.request.UserPatchRequestDto;
import com.example.backend.user.dto.request.UserSignRequestDto;
import com.example.backend.user.dto.response.ApproveUserListForInitialManagerResponseDto;
import com.example.backend.user.dto.response.ApproveUserListForManagerResponseDto;
import com.example.backend.user.dto.response.UserProfileResponseDto;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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

    //admin signup
    @PostMapping("/signup/admin")
    @Operation(
            summary = "회원 가입 ( 최고 관리자 )",
            description = "최고 관리자(Admin)의 회원가입을 처리합니다."
    )
    public ResponseEntity signupAdmin(@Valid @RequestBody AdminSignupRequestDto adminSignupRequestDto) {
        userService.createAdmin(adminSignupRequestDto);
        return new ResponseEntity<>(" admin( 최고 관리자 ) 생성 성공", HttpStatus.CREATED);

    }

    @GetMapping("/admin")
    @Operation(
            summary = "최고 관리자 ( admin ) 리스트 조회 ",
            description = "존재하는 최고 관리자 리스트를 조회합니다. "
    )
    public ResponseEntity getAdminList(
                                       @RequestParam(name = "page", defaultValue = "1") int page,
                                       @RequestParam(name="size", defaultValue = "10") int size) {

       Page<User> approveUserList = userService.getAdminList(PageRequest.of(page -1, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), " admin( 최고 관리자 ) 리스트 조회 성공", approveUserList),
                HttpStatus.OK
        );
    }

    @PatchMapping("/name")
    @Operation(
            summary = "유저 이름 수정 ",
            description = "로그인한 유저의 이름을 수정할 수 있습니다. "
    )
    public ResponseEntity updateName(@Valid @RequestBody UserPatchRequestDto.changeName changeNameDto) {
        UserProfileResponseDto userProfileResponseDto = new UserProfileResponseDto(userService.updateUserName(changeNameDto));
        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), " 이름 수정 성공 ", userProfileResponseDto),
                HttpStatus.OK
        );
    }

    @PatchMapping("/email")
    @Operation(
            summary = "유저 이메일 수정  ",
            description = "로그인한 유저의 이메일을 수정할 수 있습니다. "
    )
    public ResponseEntity updateEmail(@Valid @RequestBody UserPatchRequestDto.changeEmail changeEmailDto) {
        UserProfileResponseDto userProfileResponseDto = new UserProfileResponseDto(userService.updateUserEmail(changeEmailDto));
        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), " 이메일 수정 성공 ", userProfileResponseDto),
                HttpStatus.OK
        );
    }

    @PatchMapping("/password")
    @Operation(
            summary = "유저 비밀번호 수정  ",
            description = "로그인한 유저의 비밀번호를 수정할 수 있습니다. "
    )
    public ResponseEntity updatePassword(@Valid @RequestBody UserPatchRequestDto.changePassword changePassword) {
        UserProfileResponseDto userProfileResponseDto = new UserProfileResponseDto(userService.updatePassword(changePassword));

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), " 비밀번호 수정 성공 ",userProfileResponseDto),
                HttpStatus.OK
        );
    }

    @PatchMapping("/phoneNumber")
    @Operation(
            summary = "유저 핸드폰 번호 수정  ",
            description = "로그인한 유저의 핸드폰 번호를 수정할 수 있습니다. "
    )
    public ResponseEntity updatePhoneNumber(@Valid @RequestBody UserPatchRequestDto.changePhoneNumber changePhoneNumberDto) {

        UserProfileResponseDto userProfileResponseDto = new UserProfileResponseDto(userService.updateUserPhoneNumber(changePhoneNumberDto));

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "핸드폰 번호 수정 성공", userProfileResponseDto),
                HttpStatus.OK
        );

    }

    @PatchMapping("/department/{departmentId}")
    @Operation(
            summary = "유저 부서 수정  ",
            description = "로그인한 유저의 부서를 수정할 수 있습니다. "
    )
    public ResponseEntity updateDepartment(@PathVariable Long departmentId ) {

        UserProfileResponseDto userProfileResponseDto = new UserProfileResponseDto(userService.updateUserDepartment(departmentId));

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "핸드폰 번호 수정 성공", userProfileResponseDto),
                HttpStatus.OK
        );

    }




    @GetMapping("/approve")
    public ResponseEntity<?> getApprovedUsers(@RequestParam String managementDashboardName,
                                              @RequestParam(defaultValue = "1") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<?> responseList = userService.getUserStatusResponseList(
                managementDashboardName,
                pageRequest,
                name -> userService.getApprovedList(name, pageRequest)
        );
        return ResponseEntity.ok(ApiResponse.of(200, "승인된 유저 리스트 조회 성공", responseList));
    }

    @GetMapping("/request")
    public ResponseEntity<?> getRequestedUsers(@RequestParam String managementDashboardName,
                                               @RequestParam(defaultValue = "1") int page,
                                               @RequestParam(defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<?> responseList = userService.getUserStatusResponseList(
                managementDashboardName,
                pageRequest,
                name -> userService.getRequestList(name, pageRequest)
        );
        return ResponseEntity.ok(ApiResponse.of(200, "요청한 유저 리스트 조회 성공", responseList));
    }

    @GetMapping("/reject")
    public ResponseEntity<?> getRejectedUsers(@RequestParam String managementDashboardName,
                                              @RequestParam(defaultValue = "1") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<?> responseList = userService.getUserStatusResponseList(
                managementDashboardName,
                pageRequest,
                name -> userService.getRejectList(name, pageRequest)
        );
        return ResponseEntity.ok(ApiResponse.of(200, "거절된 유저 리스트 조회 성공", responseList));
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

    @PostMapping("/approve/manager/{userId}")
    @Operation(
            summary = "최초 매니저가 일반 매니저를 승인",
            description = "최초 생성 매니저가 일반 매니저의 관리페이지 접근 요청을 승인합니다."
    )
    public ResponseEntity<?> approveManagerAccess(@PathVariable Long userId) {
        userService.approveManager(userId);

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "접근 권한이 승인되었습니다."),
                HttpStatus.OK
        );
    }


    @PostMapping("/reject/manager/{userId}")
    @Operation(
            summary = "최초 매니저가 일반 매니저를 거부",
            description = "최초 생성 매니저가 일반 매니저의 관리페이지 접근 요청을 거부합니다."
    )
    public ResponseEntity<?> rejectManagerAccess(@PathVariable Long userId) {
        userService.rejectManager(userId);
        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "접근 권한이 거부되었습니다."),
                HttpStatus.OK
        );

    }

    @GetMapping("/reject/manager")
    @Operation(
            summary = "해당 관리 페이지 사용이 거부된 매니저 리스트 조회 ",
            description = "해당 관리 페이지 사용이 거부된 매니저 리스트를 조회할 수 있습니다."
    )
    public ResponseEntity<?> getRejectManager(@RequestParam String managementDashboardName
            ,@RequestParam(name = "page", defaultValue = "1") int page,
                                           @RequestParam(name="size", defaultValue = "10") int size) {

        Page<User> approveUserList = userService.getRejectManagerList(managementDashboardName,
                PageRequest.of(page -1, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        Page<ApproveUserListForInitialManagerResponseDto> responseList = approveUserList.map(ApproveUserListForInitialManagerResponseDto::new);;

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "사용이 거부된 매니저 리스트 조회 성공", responseList),
                HttpStatus.OK
        );

    }

    @GetMapping("/approve/manager")
    @Operation(
            summary = "해당 관리 페이지 사용이 승인된 매니저 리스트 조회  ",
            description = "해당 관리 페이지 사용이 승인된 매니저 리스트를 조회할 수 있습니다."
    )
    public ResponseEntity<?> getApproveManager(@RequestParam String managementDashboardName
            ,@RequestParam(name = "page", defaultValue = "1") int page,
                                              @RequestParam(name="size", defaultValue = "10") int size) {

        Page<User> approveUserList = userService.getApprovedManagerList(managementDashboardName,
                PageRequest.of(page -1, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        Page<ApproveUserListForInitialManagerResponseDto> responseList = approveUserList.map(ApproveUserListForInitialManagerResponseDto::new);;

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "사용이 승인된 매니저 리스트 조회 성공", responseList),
                HttpStatus.OK
        );

    }

    @GetMapping("/request/manager")
    @Operation(
            summary = "해당 관리 페이지 사용을 요청한 매니저 리스트 조회  ",
            description = "해당 관리 페이지 사용을 요청한 매니저 리스트를 조회할 수 있습니다."
    )
    public ResponseEntity<?> getRequestManager(@RequestParam String managementDashboardName
            ,@RequestParam(name = "page", defaultValue = "1") int page,
                                               @RequestParam(name="size", defaultValue = "10") int size) {

        Page<User> approveUserList = userService.getRequestManagerList(managementDashboardName,
                PageRequest.of(page -1, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        Page<ApproveUserListForInitialManagerResponseDto> responseList = approveUserList.map(ApproveUserListForInitialManagerResponseDto::new);;

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "사용을 요청한 매니저 리스트 조회 성공", responseList),
                HttpStatus.OK
        );

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

    @DeleteMapping("/admin")
    @Operation(
            summary = "admin 유저 삭제 구현  ",
            description = "admin 유저를 삭제할 수 있습니다.  "
    )
    public ResponseEntity updateDepartment( ) {

        userService.deleteAdmin();

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "amdin 유저 삭제 완료"),
                HttpStatus.OK
        );

    }










}