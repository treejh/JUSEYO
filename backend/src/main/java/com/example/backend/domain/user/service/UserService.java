package com.example.backend.domain.user.service;



import com.example.backend.domain.department.entity.Department;
import com.example.backend.domain.department.repository.DepartmentRepository;
import com.example.backend.domain.department.service.DepartmentService;
import com.example.backend.domain.user.dto.request.EmailRequestDto;
import com.example.backend.domain.user.dto.request.PhoneRequestDto;
import com.example.backend.domain.user.dto.response.ApproveUserListForInitialManagerResponseDto;
import com.example.backend.domain.user.dto.response.ApproveUserListForManagerResponseDto;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.email.entity.EmailMessage;
import com.example.backend.domain.user.email.service.EmailService;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.RoleType;
import com.example.backend.enums.Status;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.domain.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.domain.role.service.RoleService;
import com.example.backend.domain.role.entity.Role;
import com.example.backend.global.security.jwt.service.TokenService;
import com.example.backend.domain.user.dto.request.AdminSignupRequestDto;
import com.example.backend.domain.user.dto.request.EmailVerificationRequest;
import com.example.backend.domain.user.dto.request.InitialManagerSignupRequestDto;
import com.example.backend.domain.user.dto.request.ManagerSignupRequestDto;
import com.example.backend.domain.user.dto.request.UserPatchRequestDto;
import com.example.backend.domain.user.dto.request.UserSignRequestDto;
import com.example.backend.domain.user.dto.response.UserSearchProjection;
import com.example.backend.domain.user.repository.UserRepository;
import com.example.backend.global.utils.CreateRandomNumber;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final ManagementDashboardRepository managementDashboardRepository;
    private final DepartmentRepository departmentRepository;

    private final RoleService roleService;
    private final DepartmentService departmentService;
    private final EmailService emailService;



    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    // 알림용 - 현재 페이지 저장: userId -> pageUrl
    private final Map<Long, String> userCurrentPageMap = new ConcurrentHashMap<>();

    @Transactional
    public User createUser(UserSignRequestDto userSignRequestDto) {

        Role role = roleService.findRoleByRoleType(RoleType.USER);
        ManagementDashboard managementDashboard = findByPageName(userSignRequestDto.getManagementPageName());

        Department department =departmentService.findDepartmentByName(managementDashboard.getId(),
                userSignRequestDto.getDepartmentName());


        User user =User.builder()
                .email(userSignRequestDto.getEmail())
                .name(userSignRequestDto.getName())
                .managementDashboard(managementDashboard)
                .department(department)
                .phoneNumber(userSignRequestDto.getPhoneNumber())
                .password(passwordEncoder.encode(userSignRequestDto.getPassword()))
                .status(Status.ACTIVE)
                .approvalStatus(ApprovalStatus.REQUESTED)
                .role(role)
                .build();
        userValid(user);

        return userRepository.save(user);
    }




    @Transactional
    public User createInitialManager(InitialManagerSignupRequestDto initialManagerSignupRequestDto) {

        Role role = roleService.findRoleByRoleType(RoleType.MANAGER);

        User manager =User.builder()
                .email(initialManagerSignupRequestDto.getEmail())
                .name(initialManagerSignupRequestDto.getName()+" 매니저")
                .password(passwordEncoder.encode(initialManagerSignupRequestDto.getPassword()))
                .phoneNumber(initialManagerSignupRequestDto.getPhoneNumber())
                .initialManager(true)
                .role(role)
                .status(Status.ACTIVE)
                //관리자는 항상 승인된 상태이기 때문에 APPROVED
                .approvalStatus(ApprovalStatus.APPROVED)
                .build();
        userValid(manager);
        return userRepository.save(manager);
    }

    @Transactional
    public User createManager(ManagerSignupRequestDto managerSignupRequestDto) {

        Role role = roleService.findRoleByRoleType(RoleType.MANAGER);
        ManagementDashboard managementDashboard = findByPageName(managerSignupRequestDto.getManagementPageName());

        User manager =User.builder()
                .email(managerSignupRequestDto.getEmail())
                .name(managerSignupRequestDto.getName() +" 매니저")
                .password(passwordEncoder.encode(managerSignupRequestDto.getPassword()))
                .phoneNumber(managerSignupRequestDto.getPhoneNumber())
                .managementDashboard(managementDashboard)
                .initialManager(false)
                .role(role)
                .status(Status.ACTIVE)
                //일반 관리자는 , 최초 관리자에게 승인을 받아야 하기 때문에 requested상태
                .approvalStatus(ApprovalStatus.REQUESTED)
                .build();
        userValid(manager);
        return userRepository.save(manager);
    }

    @Transactional
    public User createAdmin(AdminSignupRequestDto adminSignupRequestDto) {

        Role role = roleService.findRoleByRoleType(RoleType.ADMIN);

        User manager =User.builder()
                .email(adminSignupRequestDto.getEmail())
                .name(adminSignupRequestDto.getName())
                .password(passwordEncoder.encode(adminSignupRequestDto.getPassword()))
                .phoneNumber(adminSignupRequestDto.getPhoneNumber())
                .role(role)
                .status(Status.ACTIVE)
                .approvalStatus(ApprovalStatus.APPROVED)
                .build();
        userValid(manager);

        return userRepository.save(manager);
    }

    public Page<User> getAdminList(Pageable pageable) {

        Role role = roleService.findRoleByRoleType(RoleType.ADMIN);
        // admin이 아닌 경우 예외 처리
        if (!isAdmin()) {
            throw new BusinessLogicException(ExceptionCode.NOT_ADMIN);
        }

        return userRepository.findByRole(role,pageable);

    }




    // 매니저가 관리페이지에 요청된 권한 리스트들을 조회하는 공통 로직
    private Page<User> getUserListByApprovalStatus(String managementDashboardName, ApprovalStatus approvalStatus, Pageable pageable) {
        ManagementDashboard managementDashboard = findByPageName(managementDashboardName);
        Role role = roleService.findRoleByRoleType(RoleType.USER);

        // admin은 모든 유저를 조회할 수 있어야 함
        if (isAdmin()) {
            return userRepository.findByManagementDashboardAndApprovalStatusAndRole(
                    managementDashboard, approvalStatus, pageable, role);
        }

        // 해당 관리 페이지에 속한 유저인지 확인
        validateManagementDashboardUser(managementDashboard);

        //현재 로그인한 유저가 매니저인지 확인하는 메서드
        validManager();

        return userRepository.findByManagementDashboardAndApprovalStatusAndRole(
                managementDashboard, approvalStatus, pageable, role);
    }


    // 승인된 유저 리스트 가져오기
    public Page<User> getApprovedList(String managementDashboardName, Pageable pageable) {
        return getUserListByApprovalStatus(managementDashboardName, ApprovalStatus.APPROVED, pageable);
    }

    // 요청된 유저 리스트 가져오기
    public Page<User> getRequestList(String managementDashboardName, Pageable pageable) {
        return getUserListByApprovalStatus(managementDashboardName, ApprovalStatus.REQUESTED, pageable);
    }

    // 거부된 유저 리스트 가져오기
    public Page<User> getRejectList(String managementDashboardName, Pageable pageable) {
        return getUserListByApprovalStatus(managementDashboardName, ApprovalStatus.REJECTED, pageable);
    }


    private Page<User> getManagerListByApprovalStatus(String managementDashboardName, ApprovalStatus approvalStatus, Pageable pageable) {
        ManagementDashboard managementDashboard = findByPageName(managementDashboardName);
        Role role = roleService.findRoleByRoleType(RoleType.MANAGER);

        // admin은 모든 유저를 조회할 수 있어야 함
        if (isAdmin()) {
            return userRepository.findByManagementDashboardAndApprovalStatusAndRole(
                    managementDashboard, approvalStatus, pageable, role);
        }


        //1. 현재 로그인한 유저가 매니저인지 확인하는 메서드
        validManager();

        // 2. 현재 로그인한 유저가 해당 관리페이지에 속하고, 해당 관리 페이지의 최초 매니저인지 확인하는 메서드
        validateInitialManager(managementDashboard);

        return userRepository.findByManagementDashboardAndApprovalStatusAndRole(
                managementDashboard, approvalStatus, pageable, role);
    }

    // 승인된 매니저 리스트 가져오기
    public Page<User> getApprovedManagerList(String managementDashboardName, Pageable pageable) {
        return getManagerListByApprovalStatus(managementDashboardName, ApprovalStatus.APPROVED, pageable);
    }

    // 요청된 매니저 리스트 가져오기
    public Page<User> getRequestManagerList(String managementDashboardName, Pageable pageable) {
        return getManagerListByApprovalStatus(managementDashboardName, ApprovalStatus.REQUESTED, pageable);
    }

    // 거부된 매니저 리스트 가져오기
    public Page<User> getRejectManagerList(String managementDashboardName, Pageable pageable) {
        return getManagerListByApprovalStatus(managementDashboardName, ApprovalStatus.REJECTED, pageable);
    }


    @Transactional
    public void approveOrRejectUser(Long userId, ApprovalStatus approvalStatus){
        // 현재 로그인한 매니저
        User currentLoginUser = findById(tokenService.getIdFromToken());
        User requestUser = findById(userId);

        if (isAdmin()) {
            requestUser.setApprovalStatus(approvalStatus);
            userRepository.save(requestUser);
            return;
        }

        // 관리 페이지에 권한을 요청하려는 유저 아이디
        ManagementDashboard loginUsermanagementDashboard = currentLoginUser.getManagementDashboard();

        // 요청한 유저와, 요청을 받는 매니저가 다른 대시보드에 속해 있는 경우 예외처리
        if (!loginUsermanagementDashboard.equals(requestUser.getManagementDashboard())) {
            throw new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD);
        }

        // 매니저가 맞는지 확인
        validManager();

        // 상태 변경
        requestUser.setApprovalStatus(approvalStatus);
        userRepository.save(requestUser);
    }

    // 일반 회원 승인 처리
    @Transactional
    public void approveUser(Long userId) {
        approveOrRejectUser(userId, ApprovalStatus.APPROVED);
    }

    // 일반 회원 거부 처리
    @Transactional
    public void rejectUser(Long userId) {
        approveOrRejectUser(userId, ApprovalStatus.REJECTED);
    }


    @Transactional
    public void approveOrRejectManager(Long userId, ApprovalStatus approvalStatus){
        //현재 로그인한 매니저
        User currentLoginUser = findById(tokenService.getIdFromToken());
        User requestUser = findById(userId);

        if(isAdmin()){
            requestUser.setApprovalStatus(approvalStatus);
            userRepository.save(requestUser);
            return;
        }

        // 1. 매니저 승인 요청을 한 사용자가 매니저가 아닐 경우 예외처리
        validateNotManager(requestUser);

        // 2. 현재 로그인한 유저가 매니저인지 확인(매니저여야 한다)
        validManager();

        // 3. 같은 대시보드여야 함
        validateSameDashboardOrThrow(currentLoginUser, requestUser);

        // 4. 현재 로그인한 유저가 해당 관리페이지에 속하고, 해당 관리 페이지의 최초 매니저인지 확인하는 메서드
        validateInitialManager(requestUser.getManagementDashboard());

        // 승인 또는 거부 상태로 변경
        requestUser.setApprovalStatus(approvalStatus);
        userRepository.save(requestUser);
    }

    // 매니저 승인 처리
    @Transactional
    public void approveManager(Long userId) {
        approveOrRejectManager(userId, ApprovalStatus.APPROVED);
    }

    // 매니저 거부 처리
    @Transactional
    public void rejectManager(Long userId) {
        approveOrRejectManager(userId, ApprovalStatus.REJECTED);
    }

    public User findById(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(()-> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
    }

    //수정 로직

    @Transactional
    public User updateUserName(UserPatchRequestDto.changeName nameDto){
        User user = findById(tokenService.getIdFromToken());
        user.setName(nameDto.getName());
        user.setModifiedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserEmail(UserPatchRequestDto.changeEmail emailDto){
        User user = findById(tokenService.getIdFromToken());
        user.setEmail(emailDto.getEmail());
        user.setModifiedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserPhoneNumber(UserPatchRequestDto.changePhoneNumber phoneNumberDto){
        User user = findById(tokenService.getIdFromToken());
        user.setPhoneNumber(phoneNumberDto.getPhoneNumber());
        user.setModifiedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserDepartment(Long departmentId){
        User user = findById(tokenService.getIdFromToken());

        Department changeDepartment = departmentRepository.findById(departmentId)
                .orElseThrow(()-> new BusinessLogicException(ExceptionCode.DEPARTMENT_NOT_FOUND));

        //해당 부서가, 유저의 관리페이지에 존재하는 부서인지 확인해야함

        //1. 현재 로그인한 유저의 관리 페이지
        ManagementDashboard loginUsermanagementDashboard = user.getManagementDashboard();

        //2. 해당 부서의 관리 페이지가, 유저의 관리 페이지와 같지 않다면, 해당 관리 페이지에 속한 부서가 아니라는 뜻
        if(!changeDepartment.getManagementDashboard().equals(loginUsermanagementDashboard)){
            throw new BusinessLogicException(ExceptionCode.DEPARTMENT_NOT_IN_DASHBOARD);
        }

        user.setDepartment(changeDepartment);
        userRepository.save(user);
        user.setModifiedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public User updatePassword(UserPatchRequestDto.changePassword changePasswordDto){
        User user = findById(tokenService.getIdFromToken());

        //비밀번호 다르면 변경 불가
        pwValidation(changePasswordDto.getBeforePassword(),user.getPassword());

        user.setPassword(passwordEncoder.encode(changePasswordDto.getChangePassword()));
        user.setModifiedAt(LocalDateTime.now());
        return userRepository.save(user);
    }


    public void pwValidation(String beforePassword, String currentPassword){
        if (!passwordEncoder.matches(beforePassword, currentPassword)) {
            throw new BusinessLogicException(ExceptionCode.INVALID_PASSWORD);
        }
    }

    public boolean isValidEmail(EmailRequestDto emailRequestDto){
        return userRepository.findByEmail(emailRequestDto.getEmail()).isPresent();
    }

    public boolean isValidPhone(PhoneRequestDto phoneRequestDto){
        return userRepository.findByPhoneNumber(phoneRequestDto.getPhoneNumber()).isPresent();
    }





    private boolean isAdmin() {
        return tokenService.getRoleFromToken().getRole().equals(RoleType.ADMIN);
    }


    //현재 로그인한 유저가 매니저인지 확인하는 메서드
    //접근 권한도 매니저로만 주긴 할거임 ㅇㅇ
    public void validManager(){
        if(!tokenService.getRoleFromToken().getRole().equals(RoleType.MANAGER)){
            throw new BusinessLogicException(ExceptionCode.NOT_MANAGER);
        }
    }

    public void validateUserHasManagement() {
        if (findById(tokenService.getIdFromToken()).getManagementDashboard() != null) {
            throw new BusinessLogicException(ExceptionCode.USER_HAS_MANAGEMENT_DASHBOARD);
        }
    }



    //파라미터로 받은 유저가 매니저인지 확인하는 메서드
    private void validateNotManager(User user){
        if(!user.getRole().getRole().equals(RoleType.MANAGER)){
            throw new BusinessLogicException(ExceptionCode.INVALID_APPROVAL_TARGET_ROLE);
        }
    }


    //현재 로그인한 유저가, 해당 관리 페이지에속한 유저인지 확인하는 유효성 검사 메서드
    private void validateManagementDashboardUser(ManagementDashboard managementDashboard){
        userRepository.findByIdAndManagementDashboard(tokenService.getIdFromToken(),managementDashboard)
                .orElseThrow(
                        () -> new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD)
                );
    }


    //현재 로그인한 유저가 해당 관리페이지에 속하고, 해당 관리 페이지의 최초 매니저인지 확인하는 메서드
    //true면 맞다는말
    public boolean validateInitialManager(ManagementDashboard managementDashboard){
        User user = userRepository.findByIdAndManagementDashboard(tokenService.getIdFromToken(), managementDashboard)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD));

        if (!user.isInitialManager()) {
            throw new BusinessLogicException(ExceptionCode.NOT_INITIAL_MANAGER);
        }
        return true;
    }

    //현재 로그인한 유저가, 해당 페이지에 존재하는 최초 매니저가 맞는지 확인
    public boolean validInitialManager(ManagementDashboard managementDashboard){
        User user = userRepository.findByIdAndManagementDashboard(tokenService.getIdFromToken(), managementDashboard)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD));

        return user.isInitialManager();
    }

    //관리 페이지를 생성할때, 해당 유저가 최초 매니저인지 확인하는 메서드
    public void validCreateInitialManager(){
        if(!findById(tokenService.getIdFromToken()).isInitialManager()){
            throw  new BusinessLogicException(ExceptionCode.NOT_INITIAL_MANAGER);
        }
    }



    @Transactional
    public String findPassword(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(()-> new BusinessLogicException(ExceptionCode.EMAIL_NOT_FOUND));
        String randomPassword = CreateRandomNumber.randomNumber();
        user.setPassword(passwordEncoder.encode(randomPassword));

        userRepository.save(user);
        return randomPassword;
    }

    @Transactional
    public void deleteAdmin(){
        User adminUser = findById(tokenService.getIdFromToken());
        if (!isAdmin()) {
            throw new BusinessLogicException(ExceptionCode.NOT_ADMIN);
        }
        userRepository.delete(adminUser);
    }


    @Transactional
    public void deleteUser(){
        User loginUser = findById(tokenService.getIdFromToken());
        loginUser.setStatus(Status.STOP);
        userRepository.save(loginUser);
    }


    public User verifiedUser(long projectId) {
        Optional<User> user = userRepository.findById(projectId);
        return user.orElseThrow(() -> new BusinessLogicException(ExceptionCode.BOARD_NOT_FOUND));
    }

    //이메일 관련 로직
    @Transactional
    public void findPasswordByEmail(String email){
        EmailMessage emailMessage = EmailMessage.builder()
                .to(email)
                .subject("[Juseyo] 임시 비밀번호 발급")
                .build();
        User user = findByEmail(email);
        String randomPassword = CreateRandomNumber.randomNumber();
        user.setPassword(passwordEncoder.encode(randomPassword));
        userRepository.save(user);

        emailService.sendPassword(emailMessage, "password",randomPassword);

    }

    @Transactional
    public void sendCertificationNumber(String email){
        EmailMessage emailMessage = EmailMessage.builder()
                .to(email)
                .subject("[Juseyo] 인증번호 발급")
                .build();
        //이메일 중복 회원가입 불가
        validateEmail(email);

        emailService.sendCertificationNumber(emailMessage, "certificationNumber");

    }

    @Transactional
    public void verifyEmailCode(EmailVerificationRequest emailVerificationRequest){
        validateEmail(emailVerificationRequest.getEmail());
        if(!emailService.verifiedCode(emailVerificationRequest.getEmail(),emailVerificationRequest.getAuthCode())){
            throw new BusinessLogicException(ExceptionCode.EMAIL_VERIFICATION_FAILED);
        };

    }

    public User findUserByToken(){
        return findById(tokenService.getIdFromToken());
    }

    public String findEmailByPhone(String phone){
        User user = findByPhoneNumber(phone);

        return user.getEmail();
    }




    public Page<User> getUserListForChat(String managementDashboardName, Pageable pageable) {
        ManagementDashboard managementDashboard = findByPageName(managementDashboardName);
        User loginUser = findById(tokenService.getIdFromToken());
        ApprovalStatus approvalStatus = ApprovalStatus.APPROVED;

        // ADMIN인 경우: 모든 사용자 중 자기 자신 제외
        if (isAdmin()) {
            Role role = roleService.findRoleByRoleType(RoleType.USER); // 유지
            return userRepository.findByManagementDashboardAndApprovalStatusAndRoleAndIdNot(
                    managementDashboard, approvalStatus, pageable, role, loginUser.getId()
            );
        }

        // MANAGER인 경우: USER와 MANAGER 둘 다 조회
        if (loginUser.getRole().getRole() == RoleType.MANAGER) {
            List<Role> roles = roleService.findRolesByRoleTypes(List.of(RoleType.USER, RoleType.MANAGER));
            return userRepository.findByManagementDashboardAndApprovalStatusAndRoleInAndIdNot(
                    managementDashboard, approvalStatus, pageable, roles, loginUser.getId()
            );
        }

        // 기본 유저 검증 및 일반 사용자 조회
        validateManagementDashboardUser(managementDashboard);
        Role role = roleService.findRoleByRoleType(RoleType.USER);
        return userRepository.findByManagementDashboardAndApprovalStatusAndRoleAndIdNot(
                managementDashboard, approvalStatus, pageable, role, loginUser.getId()
        );
    }







    public User findByEmail(String email){
        return userRepository.findByEmail(email).orElseThrow(
                () -> new BusinessLogicException(ExceptionCode.EMAIL_NOT_FOUND));
    }

    public User findByPhoneNumber(String phoneNumber){
        return userRepository.findByPhoneNumber(phoneNumber).orElseThrow(
                () -> new BusinessLogicException(ExceptionCode.PHONE_NUMBER_NOT_FOUND));
    }

    public void userValid(User user){
        validateEmail(user.getEmail());
        validatePhoneNumber(user.getPhoneNumber());
    }



    private void validateEmail(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BusinessLogicException(ExceptionCode.ALREADY_HAS_EMAIL);
        }
    }

    private void validatePhoneNumber(String phone) {
        if (userRepository.findByPhoneNumber(phone).isPresent()) {
            throw new BusinessLogicException(ExceptionCode.ALREADY_HAS_PHONE_NUMBER);
        }
    }


    public void validPassword(String dtoPassword, String userPassword) {
        if (!passwordEncoder.matches(dtoPassword, userPassword)) {
            throw new BusinessLogicException(ExceptionCode.INVALID_PASSWORD);  // 비밀번호 불일치시 예외 던지기
        }
    }

    private void validateSameDashboardOrThrow(User current, User target) {
        if (!current.getManagementDashboard().equals(target.getManagementDashboard())) {
            throw new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD);
        }
    }

    public ManagementDashboard findByPageName(String name){
        return  managementDashboardRepository.findByName(name).orElseThrow(
                ()-> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND)
        );
    }

    public Page<?> getUserStatusResponseList(
            String managementDashboardName,
            Pageable pageable,
            Function<String, Page<User>> userListFetcher // approve/request/reject 중 하나
    ) {
        Page<User> users = userListFetcher.apply(managementDashboardName);
        ManagementDashboard dashboard = findByPageName(managementDashboardName);

        if (validInitialManager(dashboard)) {
            return users.map(ApproveUserListForInitialManagerResponseDto::new);
        } else {
            return users.map(ApproveUserListForManagerResponseDto::new);
        }
    }

    public List<User> findByManagerList(ManagementDashboard managementDashboard){

        Role role = roleService.findRoleByRoleType(RoleType.MANAGER);
        ApprovalStatus approvalStatus = ApprovalStatus.APPROVED;
        return userRepository.findByManagementDashboardAndApprovalStatusAndRole(
                managementDashboard, approvalStatus, role);
    }
    public List<User> findAllByIds(List<Long> userIds) {
        List<User> users = userRepository.findAllById(userIds);

        if (users.size() != userIds.size()) {
            List<Long> foundIds = users.stream()
                    .map(User::getId)
                    .toList();
            List<Long> missingIds = userIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .toList();

            throw new BusinessLogicException(
                    ExceptionCode.USER_NOT_FOUND,
                    "존재하지 않는 사용자 ID: " + missingIds
            );
        }

        return users;
    }

    public List<User> findUsersByRole(Role role) {
        return userRepository.findAllByRole(role);
    }

    public User findUserByName(String name){
        return userRepository.findByName(name).orElseThrow(()-> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
    }

    // 회원 검색
    public Page<UserSearchProjection> searchUsers(Long mdId, String keyword, Pageable pageable) {

        // 대시보드가 실제로 존재하는지 확인
        ManagementDashboard md = managementDashboardRepository.findById(mdId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND));

        // 로그인한 사용자가 그 대시보드에 속해있는지 검증
        validateManagementDashboardUser(md);

        // 실제 검색 실행
        return userRepository.searchUsers(mdId, keyword, pageable);
    }

    // 회원 검색 - 일반 회원만 검색 (승인 된 일반 회원만)
    public Page<UserSearchProjection> searchBasicUsers(Long managementDashboardId, String keyword, Pageable pageable) {
        // 대시보드가 실제로 존재하는지 확인
        ManagementDashboard md = managementDashboardRepository.findById(managementDashboardId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND));

        // 로그인한 사용자가 그 대시보드에 속해있는지 검증
        validateManagementDashboardUser(md);

        // 검색 키워드 처리
        String searchKeyword = (keyword != null && !keyword.isEmpty()) ? keyword : "";

        // 실제 검색 실행 (승인된 사용자만 조회)
        return userRepository.searchBasicUsers(managementDashboardId, searchKeyword, RoleType.USER, ApprovalStatus.APPROVED, pageable);
    }

}