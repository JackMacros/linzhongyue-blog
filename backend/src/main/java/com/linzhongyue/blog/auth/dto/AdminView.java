package com.linzhongyue.blog.auth.dto;

import com.linzhongyue.blog.auth.entity.AdminUser;

import java.time.LocalDateTime;

public record AdminView(
        Long id,
        String username,
        String nickname,
        String email,
        String avatarUrl,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt
) {
    public static AdminView from(AdminUser user) {
        return new AdminView(user.getId(), user.getUsername(), user.getNickname(), user.getEmail(),
                user.getAvatarUrl(), user.getLastLoginAt(), user.getCreatedAt());
    }
}

