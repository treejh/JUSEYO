package com.example.backend.role.repository;

import com.example.backend.enums.RoleType;
import com.example.backend.role.entity.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role,Long> {

    Optional<Role> findByRole(RoleType roleType);

}
