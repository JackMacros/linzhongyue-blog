package com.linzhongyue.blog.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileRequest(
        @NotBlank(message = "昵称不能为空") @Size(max = 50, message = "昵称不能超过 50 个字符") String nickname,
        @Email(message = "邮箱格式不正确") @Size(max = 100, message = "邮箱不能超过 100 个字符") String email,
        @Size(max = 1000, message = "头像地址过长") String avatarUrl
) {
}

