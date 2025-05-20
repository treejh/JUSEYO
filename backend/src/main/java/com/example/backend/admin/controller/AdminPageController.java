package com.example.backend.admin.controller;

import com.example.backend.enums.Status;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.managementDashboard.dto.ManagementDashBoardResponseDto;
import com.example.backend.managementDashboard.service.ManagementDashboardService;
import com.example.backend.role.entity.Role;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.dto.request.AdminSignupRequestDto;
import com.example.backend.user.dto.request.UserLoginRequestDto;
import com.example.backend.user.entity.User;
import com.example.backend.user.service.UserService;
import com.example.backend.utils.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminPageController {

    private final UserService userService;
    private final TokenService tokenService;
    private final ManagementDashboardService managementDashboardService;


    @GetMapping
    public String adminDashboard() {
        return "admin-dashboard";
    }

    @GetMapping("/signup")
    public String adminSignupPage() {
        return "admin-signup";
    }

    @GetMapping("/login")
    public String adminLoginPage() {
        return "admin-login";
    }

    @PostMapping("/signup")
    public String signupAdmin(AdminSignupRequestDto dto) {
        userService.createAdmin(dto);
        return "redirect:/api/v1/admin/login";
    }

    @PostMapping("/login")
    public String login(UserLoginRequestDto dto,RedirectAttributes redirectAttributes) {
        User user = userService.findByEmail(dto.getEmail());
        try{
            userService.validPassword(dto.getPassword(), user.getPassword());
        }catch (BusinessLogicException e){
            redirectAttributes.addAttribute("error", "true");
            return "redirect:/admin/login";
        }
        tokenService.makeCookies(user);
        return "redirect:/api/v1/admin/main";
    }

    @GetMapping("/main")
    public String adminMain() {
        return "admin-main";
    }

    @PostMapping("/logout")
    @Operation(
            summary = "로그아웃",
            description = "로그아웃을 처리합니다."
    )
    public String logout(){
        Role role = tokenService.getRoleFromToken();
        String name = role.getRole().name();
        tokenService.deleteCookie("refreshToken");
        tokenService.deleteCookie("accessToken");
        return "admin-dashboard";
    }

    @GetMapping("/list")
    @Operation(
            summary = "최고 관리자 ( admin ) 리스트 조회 ",
            description = "존재하는 최고 관리자 리스트를 조회합니다. "
    )
    public String getAdminList(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name="size", defaultValue = "10") int size,
            Model model) {

        Page<User> approveUserList = userService.getAdminList(PageRequest.of(page -1, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        model.addAttribute("admins", approveUserList);
        return "admin-list";
    }

    @Operation(summary = "관리 페이지 요청 목록 페이지", description = "관리 페이지 승인 요청 목록 페이지를 요청 .")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/management/approval")
    public String showApprovalList(@RequestParam(defaultValue = "1") int page,
                                   @RequestParam(defaultValue = "10") int size,
                                   Model model) {

        Page<ManagementDashBoardResponseDto> pendingPages =
                managementDashboardService.findAllManagementDashBoard(PageRequest.of(page - 1, size), Status.ACTIVE,false);
        model.addAttribute("managements", pendingPages);
        return "management-approval";
    }

    @Operation(summary = "관리 페이지 승인", description = "ID를 기준으로 관리 페이지를 승인 처리합니다.")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/management/approve/{id}")
    public String approve(@PathVariable(name = "id") Long id) {
        managementDashboardService.approvalManagementDashBoard(id);
        return "redirect:/api/v1/management/approval";
    }

    @Operation(summary = "관리 페이지 삭제", description = "ID를 기준으로 관리 페이지를 삭제합니다.")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/management/{id}")
    public String deleteManagementDashboard(@Parameter(description = "관리 페이지 ID") @PathVariable(name = "id") Long id) {
        managementDashboardService.deleteManagementDashBoard(id);
        return "redirect:/api/v1/management/approval";
    }

}
