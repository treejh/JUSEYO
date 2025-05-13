package com.example.backend.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
public class EmailVerificationRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String authCode;

}
