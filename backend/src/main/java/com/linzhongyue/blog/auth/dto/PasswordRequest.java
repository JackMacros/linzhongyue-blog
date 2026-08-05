package com.linzhongyue.blog.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordRequest(
        @NotBlank(message = "请输入当前密码") String currentPassword,
        @NotBlank(message = "请输入新密码") @Size(min = 8, max = 100, message = "新密码长度必须为 8 到 100 位") String newPassword,
        @NotBlank(message = "请再次输入新密码") String confirmPassword
) {
}

