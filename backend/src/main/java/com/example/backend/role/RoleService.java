package com.example.backend.role;


import com.example.backend.enums.RoleType;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.role.entity.Role;
import com.example.backend.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleService {
    private final RoleRepository roleRepository;

    public Role findRoleByRoleType(RoleType roleType){
        return roleRepository.findByRole(roleType).orElseThrow(
                () -> new BusinessLogicException(ExceptionCode.ROLE_NOT_FOUND)
        );

    }


}
