package com.example.backend.user.dto.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserPatchRequestDto {


    @Getter
    @AllArgsConstructor
    public static class changePassword {

        @NotEmpty
        @Pattern(
                regexp = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*\\W).{8,20}$",
                message = "비밀번호는 영문자, 숫자, 특수문자를 포함한 8~20자리."
        )

        private String changePassword;

        @NotEmpty
        private String beforePassword;


    }

    @Getter
    @AllArgsConstructor
    public static class changeName {

        @NotEmpty(message = "이름은 필수입니다.")
        @Size(max = 20, message = "이름은 최대 20자까지 가능합니다.")
        @Pattern(regexp = "^[가-힣]+$", message = "이름은 한글만 입력 가능합니다.")
        private String name;

    }

    @Getter
    @AllArgsConstructor
    public static class changePhoneNumber {

        @NotBlank
        @Pattern(regexp = "^\\d{3}-\\d{4}-\\d{4}$", message = "전화번호 형식은 010-1234-5678이어야 합니다.")
        private String phoneNumber;

    }

    @Getter
    @AllArgsConstructor
    public static class changeEmail {

        @NotBlank
        @Email
        private String email;

    }






}
