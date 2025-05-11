package com.example.backend.user.service;



import com.example.backend.department.entity.Department;
import com.example.backend.department.service.DepartmentService;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.RoleType;
import com.example.backend.enums.Status;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.managementDashboard.service.ManagementDashboardService;
import com.example.backend.role.RoleService;
import com.example.backend.role.entity.Role;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.dto.request.InitialManagerSignupRequestDto;
import com.example.backend.user.dto.request.ManagerSignupRequestDto;
import com.example.backend.user.dto.request.UserSignRequestDto;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import com.example.backend.utils.CreateRandomNumber;
import java.util.List;
import java.util.Optional;
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
    private final RoleService roleService;
    private final ManagementDashboardService managementDashboardService;
    private final DepartmentService departmentService;

    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @Transactional
    public User createUser(UserSignRequestDto userSignRequestDto) {

        Role role = roleService.findRoleByRoleType(RoleType.USER);
        ManagementDashboard managementDashboard = managementDashboardService.findByPageName(userSignRequestDto.getManagementPageName());
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
                .name(initialManagerSignupRequestDto.getName())
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
        ManagementDashboard managementDashboard = managementDashboardService.findByPageName(managerSignupRequestDto.getManagementPageName());

        User manager =User.builder()
                .email(managerSignupRequestDto.getEmail())
                .name(managerSignupRequestDto.getName())
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


    //승인된 유저 리스트 가지고오기
    //근데 역할이 MANAGER이여야 하고, 만약 InitialManager이면 maskedPhoneNumber 로 가게 -> 이건 controller에서 ㄱ ?
    public Page<User> getApprovedList(String managementDashboardName, Pageable pageable){

        ManagementDashboard managementDashboard = managementDashboardService.findByPageName(managementDashboardName);
        Role role = roleService.findRoleByRoleType(RoleType.USER);

        //admin은 다 조회가 가능해야 함
        if(isAdmin()){
            return userRepository.findByManagementDashboardAndApprovalStatusAndRole(
                    managementDashboard,
                    ApprovalStatus.APPROVED,pageable,role
            );
        }

        //해당 관리 페이지에 속한 유저인지 확인
        isManagementDashboardUser(managementDashboard);

        //매니저가 맞는지 확인
        validManager();

        return userRepository.findByManagementDashboardAndApprovalStatusAndRole(
                managementDashboard,
                ApprovalStatus.APPROVED,pageable,role
        );
    }

    //요청된 유저 리스트 가지고오기
    //근데 요청하는 역할이 MANAGER이여야 하고, 만약 InitialManager이면 maskedPhoneNumber 로 가게 -> 이건 controller에서 ㄱ ?
    public Page<User> getRequestList(String managementDashboardName, Pageable pageable){

        ManagementDashboard managementDashboard = managementDashboardService.findByPageName(managementDashboardName);
        Role role = roleService.findRoleByRoleType(RoleType.USER);
        //admin은 다 조회가 가능해야 함
        if(isAdmin()){
            return userRepository.findByManagementDashboardAndApprovalStatusAndRole(
                    managementDashboard,
                    ApprovalStatus.REQUESTED,pageable,role
            );
        }

        //해당 관리 페이지에 속한 유저인지 확인
        isManagementDashboardUser(managementDashboard);

        //매니저가 맞는지 확인
        validManager();

        return userRepository.findByManagementDashboardAndApprovalStatusAndRole(
                managementDashboard,
                ApprovalStatus.REQUESTED,pageable,role
        );

    }

    //거부된 유저 리스트 가지고오기
    //근데 요청하는 역할이 MANAGER이여야 하고, 만약 InitialManager이면 maskedPhoneNumber 로 가게 -> 이건 controller에서 ㄱ ?
    public Page<User> getRejectList(String managementDashboardName, Pageable pageable){

        ManagementDashboard managementDashboard = managementDashboardService.findByPageName(managementDashboardName);
        Role role = roleService.findRoleByRoleType(RoleType.USER);
        //admin은 다 조회가 가능해야 함
        if(isAdmin()){
            return userRepository.findByManagementDashboardAndApprovalStatusAndRole(
                    managementDashboard,
                    ApprovalStatus.REJECTED,pageable,role
            );
        }

        //해당 관리 페이지에 속한 유저인지 확인
        isManagementDashboardUser(managementDashboard);

        //매니저가 맞는지 확인
        validManager();

        return userRepository.findByManagementDashboardAndApprovalStatusAndRole(
                managementDashboard,
                ApprovalStatus.REJECTED,pageable,role
        );

    }

    public User findById(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(()-> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
    }


    //관리 페이지에 요청한 유저를 승인하는 메서드
    @Transactional
    public void approveUser(Long userId){
        //현재 로그인한 매니저
        User currentLoginUser = findById(tokenService.getIdFromToken()) ;
        User requestUser = findById(userId);

        if(isAdmin()){
            requestUser.setApprovalStatus(ApprovalStatus.APPROVED);
            userRepository.save(requestUser);
            return;
        }

        //관리페이지에 권한을 요청하려는 유저 아이디

        ManagementDashboard LoginUsermanagementDashboard = currentLoginUser.getManagementDashboard();

        //요청한 유저와, 요청을 받는 매니저가 다른 대시보드에 속해있는 경우 예외처리
        if(!LoginUsermanagementDashboard.equals(requestUser.getManagementDashboard())){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD);
        }

        //매니저가 맞는지 확인
        validManager();


        //승인 상태로 변경
        requestUser.setApprovalStatus(ApprovalStatus.APPROVED);
        userRepository.save(requestUser);

    }

    private boolean isAdmin() {
        return tokenService.getRoleFromToken().getRole().equals(RoleType.ADMIN);
    }

    //관리 페이지에 요청한 유저를 거부하는 메서드
    @Transactional
    public void rejectUser(Long userId){
        //현재 로그인한 매니저
        User currentLoginUser = findById(tokenService.getIdFromToken()) ;



        //관리페이지 권한을 거부하려는 유저 아이디
        User requestUser = findById(userId);

        if(isAdmin()){
            requestUser.setApprovalStatus(ApprovalStatus.REJECTED);
            userRepository.save(requestUser);
            return;
        }
        ManagementDashboard LoginUsermanagementDashboard = currentLoginUser.getManagementDashboard();

        //요청한 유저와, 요청을 받는 매니저가 다른 대시보드에 속해있는 경우 예외처리
        if(!LoginUsermanagementDashboard.equals(requestUser.getManagementDashboard())){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD);
        }

        //매니저가 맞는지 확인
        validManager();

        //거부 상태로 변경
        requestUser.setApprovalStatus(ApprovalStatus.REJECTED);
        userRepository.save(requestUser);

    }


    //매니저인지 확인하는 메서드
    //접근 권한도 매니저로만 주긴 할거임 ㅇㅇ
    public void validManager(){
        log.info("매니저인지 확인 !! " + tokenService.getRoleFromToken().getRole().name());
        if(!tokenService.getRoleFromToken().getRole().equals(RoleType.MANAGER)){
            throw new BusinessLogicException(ExceptionCode.UNAUTHORIZED_ROLE);
        }
    }


    //해당 관리 페이지에속한 유저인지 확인하는 유효성 검사 메서드
    public void isManagementDashboardUser(ManagementDashboard managementDashboard){
        userRepository.findByIdAndManagementDashboard(tokenService.getIdFromToken(),managementDashboard)
                .orElseThrow(
                        () -> new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD)
                );
    }


    //해당 관리페이지에 속하고, 최초 매니저인지 확인하는 메서드
    public boolean isInitialManager(ManagementDashboard managementDashboard){


        User user = userRepository.findByIdAndManagementDashboard(tokenService.getIdFromToken(),managementDashboard)
                .orElseThrow(
                        () -> new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD)
                );
        return user.isInitialManager();

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



    public User verifiedUser(long projectId) {
        Optional<User> user = userRepository.findById(projectId);
        return user.orElseThrow(() -> new BusinessLogicException(ExceptionCode.BOARD_NOT_FOUND));
    }

//        // Update
//        public User updateUser(User user) {
//            User findUser = verifiedUser(user.getProjectId());
//            //Optional.ofNullable(user.getMemberId()).ifPresent(findUser::setMemberId);
//            Optional.ofNullable(user.getRecruitmentSize()).ifPresent(findUser::setRecruitmentSize);
//            Optional.ofNullable(user.getTitle()).ifPresent(findUser::setTitle);
//            Optional.ofNullable(user.getUserContent()).ifPresent(findUser::setUserContent);
//            Optional.ofNullable(user.getUserGoal()).ifPresent(findUser::setUserGoal);
//            Optional.ofNullable(user.getUserPartner()).ifPresent(findUser::setUserPartner);
//            Optional.ofNullable(user.getRecruitmentPeriod()).ifPresent(findUser::setRecruitmentPeriod);
//            Optional.ofNullable(user.getExpectedDuration()).ifPresent(findUser::setExpectedDuration);
//
//            return userRepository.save(findUser);
//        }

        // Delete
        public void deleteUser(long ProjectId) {
            User user = verifiedUser(ProjectId);
            userRepository.delete(user);
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



    public void validateEmail(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BusinessLogicException(ExceptionCode.ALREADY_HAS_EMAIL);
        }
    }

    public void validatePhoneNumber(String phone) {
        if (userRepository.findByPhoneNumber(phone).isPresent()) {
            throw new BusinessLogicException(ExceptionCode.ALREADY_HAS_EMAIL);
        }
    }


    public void validPassword(String dtoPassword, String userPassword) {
        if (!passwordEncoder.matches(dtoPassword, userPassword)) {
            throw new BusinessLogicException(ExceptionCode.INVALID_PASSWORD);  // 비밀번호 불일치시 예외 던지기
        }
    }


}