package com.example.backend.user.controller;


import com.example.backend.managementDashboard.service.ManagementDashboardService;
import com.example.backend.role.entity.Role;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.sms.dto.SmsRequestDto;
import com.example.backend.user.dto.request.*;
import com.example.backend.user.dto.response.ApproveUserListForInitialManagerResponseDto;
import com.example.backend.user.dto.response.UserListResponseDto;
import com.example.backend.user.dto.response.UserProfileResponseDto;
import com.example.backend.user.entity.User;
import com.example.backend.user.service.UserService;
import com.example.backend.utils.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
    @Operation(
            summary = "관리 페이지 승인된 유저   ",
            description = "승인된 유저 리스트를 조회할 수 있습니다. "
    )
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
    @Operation(
            summary = "관리 페이지 승인 요청 유저   ",
            description = "승인된 유저 리스트를 조회할 수 있습니다. "
    )
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
    @Operation(
            summary = "관리 페이지 승인이 거부된 유저   ",
            description = "거부된 유저 리스트를 조회할 수 있습니다. "
    )
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


    @GetMapping("/chat/list")
    @Operation(
            summary = "관리페이지에 속한 유저 리스트를 볼 수 있습니다. ",
            description = "승인된 유저 리스트를 조회합니다."
    )
    public ResponseEntity<?> getChatUsers(@RequestParam String managementDashboardName,
                                              @RequestParam(defaultValue = "1") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<User> approveUser = userService.getUserListForChat(managementDashboardName,pageRequest)
;
        Page<UserListResponseDto> userListResponse = approveUser.map(UserListResponseDto::new);
        return ResponseEntity.ok(ApiResponse.of(200, "승인된 유저 리스트 조회 성공", userListResponse));
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




    @PostMapping("/emails/findPassword")
    @Operation(
            summary = "비밀번호 찾기",
            description = "비밀번호를 업데이트 한 후 이메일로 결과를 반환"
    )
    public ResponseEntity<?> findPassword(@Valid @RequestBody EmailRequestDto emailRequestDto) {
        // 비밀번호 찾기 로직을 수행하고, 해당 결과를 response로 반환
       userService.findPasswordByEmail(emailRequestDto.getEmail());

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "임시 비밀번호 이메일 전송 완료"),
                HttpStatus.OK
        );
    }

    //인증번호 발급
    @PostMapping("/emails/certificationNumber")
    @Operation(
            summary = "이메일로 인증번호 전송",
            description = "사용자가 제공한 이메일 주소로 인증번호를 전송합니다. 인증번호는 이메일 인증을 위한 코드로 사용됩니다."
    )
    public ResponseEntity sendCertificationNumberMail(@Valid @RequestBody EmailRequestDto emailRequestDto) {
        userService.sendCertificationNumber(emailRequestDto.getEmail());
        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "인증번호 이메일 전송 완료 "),
                HttpStatus.OK
        );
    }

    @PostMapping("/emails/verification")
    @Operation(
            summary = "이메일 인증 확인",
            description = "사용자가 입력한 인증코드를 확인하여 이메일 인증을 진행합니다. 인증번호가 유효한 경우 인증이 완료됩니다."
    )
    public ResponseEntity sendCertificationNumberValid(@Valid @RequestBody EmailVerificationRequest emailVerificationRequest) {
        //userService.verifyEmailCode(emailVerificationRequest);

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "이메일 인증 성공 (인증 번호 인증 성공) "),
                HttpStatus.OK
        );
    }


    @GetMapping("/token")
    @Operation(
            summary = "토큰으로 유저 조회하기 ",
            description = "현재 로그인된 사용자의 정보를 조회 "
    )
    public ResponseEntity sendCertificationNumberValid() {
        UserProfileResponseDto responseDto = new UserProfileResponseDto(userService.findUserByToken());
        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "토큰으로 사용자 조회 성공 ",responseDto),
                HttpStatus.OK
        );
    }

    @GetMapping("/email/phone")
    @Operation(
            summary = "핸드폰 번호로 이메일 조회하기",
            description = "핸드폰 번호로 이메일 조회, 핸드폰 번호로 인증된 사용자만 사용 가능"
    )
    public ResponseEntity getEmailByPhone(@Valid @RequestBody SmsRequestDto smsRequestDto) {
        String response = userService.findEmailByPhone(
                smsRequestDto.getPhoneNumber());
        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "핸드폰 번호로 이메일 조회 성공 ",response),
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
    public ResponseEntity deleteAdmin( ) {

        userService.deleteAdmin();

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "amdin 유저 삭제 완료"),
                HttpStatus.OK
        );

    }



    @DeleteMapping()
    @Operation(
            summary = "유저 삭제(manager, user)  구현  ",
            description = "유저 삭제(manager, user)를 삭제할 수 있습니다.  "
    )
    public ResponseEntity updateDepartment( ) {

        userService.deleteUser();

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "amdin 유저 삭제 완료( stop 상태 ) "),
                HttpStatus.OK
        );
    }



}