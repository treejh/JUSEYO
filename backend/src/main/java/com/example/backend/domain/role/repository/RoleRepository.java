package com.example.backend.domain.role.repository;

import com.example.backend.enums.RoleType;
import com.example.backend.domain.role.entity.Role;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role,Long> {

    Optional<Role> findByRole(RoleType roleType);
    List<Role> findByRoleIn(List<RoleType> roleTypes);
}

