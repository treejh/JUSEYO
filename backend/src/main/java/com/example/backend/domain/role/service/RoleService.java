package com.example.backend.domain.role.service;


import com.example.backend.enums.RoleType;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.role.entity.Role;
import com.example.backend.domain.role.repository.RoleRepository;
import java.util.List;
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

    public List<Role> findRolesByRoleTypes(List<RoleType> roleTypes) {
        List<Role> roles = roleRepository.findByRoleIn(roleTypes);
        if (roles.size() != roleTypes.size()) {
            throw new BusinessLogicException(ExceptionCode.ROLE_NOT_FOUND);
        }
        return roles;
    }



}
