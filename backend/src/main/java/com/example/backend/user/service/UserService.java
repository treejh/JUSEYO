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
import com.example.backend.role.repository.RoleRepository;
import com.example.backend.user.dto.request.ManagerSignupRequestDto;
import com.example.backend.user.dto.request.UserSignRequestDto;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final ManagementDashboardService managementDashboardService;
    private final DepartmentService departmentService;

    private final PasswordEncoder passwordEncoder;

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

        return userRepository.save(user);
    }


    @Transactional
    public User createManager(ManagerSignupRequestDto managerSignupRequestDto) {

        Role role = roleService.findRoleByRoleType(RoleType.MANAGER);

        User manager =User.builder()
                .email(managerSignupRequestDto.getEmail())
                .name(managerSignupRequestDto.getName())
                .password(passwordEncoder.encode(managerSignupRequestDto.getPassword()))
                .phoneNumber(managerSignupRequestDto.getPhoneNumber())
                .role(role)
                .status(Status.ACTIVE)
                //관리자는 항상 승인된 상태이기 때문에 APPROVED
                .approvalStatus(ApprovalStatus.APPROVED)
                .build();
        userValid(manager);
        return userRepository.save(manager);
    }

    @Transactional
    public User findByEmail(String email){
        return userRepository.findByEmail(email).orElseThrow(
                () -> new BusinessLogicException(ExceptionCode.EMAIL_NOT_FOUND));
    }
    @Transactional
    public User findByPhoneNumber(String phoneNumber){
        return userRepository.findByPhoneNumber(phoneNumber).orElseThrow(
                () -> new BusinessLogicException(ExceptionCode.PHONE_NUMBER_NOT_FOUND));
    }



    public void userValid(User user){
        validateEmail(user.getEmail());
        validatePhoneNumber(user.getPhoneNumber());
    }

    public void validateEmail(String email) {
        if (!userRepository.findByEmail(email).isPresent()) {
            throw new BusinessLogicException(ExceptionCode.ALREADY_HAS_EMAIL);
        }
    }

    public void validatePhoneNumber(String phone) {
        if (!userRepository.findByPhoneNumber(phone).isPresent()) {
            throw new BusinessLogicException(ExceptionCode.ALREADY_HAS_EMAIL);
        }
    }


    public void validPassword(String dtoPassword, String userPassword) {
        if (!passwordEncoder.matches(dtoPassword, userPassword)) {
            throw new BusinessLogicException(ExceptionCode.INVALID_PASSWORD);  // 비밀번호 불일치시 예외 던지기
        }
    }



    public User findUser(long userId) {
        User user = verifiedUser(userId);
        return user;
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

    }