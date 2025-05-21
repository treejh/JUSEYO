package com.example.backend.global.security.dto;

import java.util.Collection;
import java.util.List;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class CustomUserDetails implements UserDetails {

    private final String username;
    private final String password;
    @Getter
    private final Long userId;
    private final List<GrantedAuthority> authorities;

    public CustomUserDetails(String email, String password, Long userId, List<GrantedAuthority> roles) {
        this.username = email;
        this.password = password;
        this.userId = userId;
        this.authorities = roles;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }



    //사용자가 만료 됐는가?
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    //사용자가 활성화가 됐는가 ?
    @Override
    public boolean isEnabled() {
        return true;
    }
}
