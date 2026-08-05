package com.linzhongyue.blog.auth;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.linzhongyue.blog.auth.dto.AdminView;
import com.linzhongyue.blog.auth.dto.LoginRequest;
import com.linzhongyue.blog.auth.dto.PasswordRequest;
import com.linzhongyue.blog.auth.dto.ProfileRequest;
import com.linzhongyue.blog.auth.entity.AdminUser;
import com.linzhongyue.blog.auth.mapper.AdminUserMapper;
import com.linzhongyue.blog.common.BusinessException;
import com.linzhongyue.blog.site.entity.SiteProfile;
import com.linzhongyue.blog.site.mapper.SiteProfileMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {
    private final AdminUserMapper adminUserMapper;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptService loginAttemptService;
    private final SiteProfileMapper siteProfileMapper;

    public AuthService(AdminUserMapper adminUserMapper, PasswordEncoder passwordEncoder,
                       LoginAttemptService loginAttemptService, SiteProfileMapper siteProfileMapper) {
        this.adminUserMapper = adminUserMapper;
        this.passwordEncoder = passwordEncoder;
        this.loginAttemptService = loginAttemptService;
        this.siteProfileMapper = siteProfileMapper;
    }

    @Transactional
    public AdminView login(LoginRequest request, String clientKey) {
        String attemptKey = clientKey + ":" + request.username().toLowerCase();
        loginAttemptService.check(attemptKey);
        AdminUser user = adminUserMapper.selectOne(new LambdaQueryWrapper<AdminUser>()
                .eq(AdminUser::getUsername, request.username()));
        if (user == null || !Boolean.TRUE.equals(user.getEnabled())
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            loginAttemptService.failed(attemptKey);
            throw BusinessException.unauthorized("用户名或密码错误");
        }
        loginAttemptService.succeeded(attemptKey);
        StpUtil.login(user.getId());
        user.setLastLoginAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        adminUserMapper.updateById(user);
        return AdminView.from(user);
    }

    public AdminView current() {
        Long id = StpUtil.getLoginIdAsLong();
        AdminUser user = adminUserMapper.selectById(id);
        if (user == null || !Boolean.TRUE.equals(user.getEnabled())) {
            StpUtil.logout();
            throw BusinessException.unauthorized("管理员账号不可用");
        }
        return AdminView.from(user);
    }

    @Transactional
    @CacheEvict(value = "siteContent", allEntries = true)
    public AdminView updateProfile(ProfileRequest request) {
        AdminUser user = requireCurrentEntity();
        user.setNickname(request.nickname().trim());
        user.setEmail(blankToNull(request.email()));
        user.setAvatarUrl(blankToNull(request.avatarUrl()));
        user.setUpdatedAt(LocalDateTime.now());
        adminUserMapper.updateById(user);
        SiteProfile siteProfile = siteProfileMapper.selectById(1L);
        if (siteProfile != null) {
            siteProfile.setAvatarUrl(user.getAvatarUrl());
            siteProfile.setUpdatedAt(LocalDateTime.now());
            siteProfileMapper.updateById(siteProfile);
        }
        return AdminView.from(user);
    }

    @Transactional
    public void updatePassword(PasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw BusinessException.badRequest("两次输入的新密码不一致");
        }
        AdminUser user = requireCurrentEntity();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw BusinessException.badRequest("当前密码错误");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw BusinessException.badRequest("新密码不能与当前密码相同");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        adminUserMapper.updateById(user);
        StpUtil.logout(user.getId());
    }

    private AdminUser requireCurrentEntity() {
        Long id = StpUtil.getLoginIdAsLong();
        AdminUser user = adminUserMapper.selectById(id);
        if (user == null) {
            throw BusinessException.notFound("管理员不存在");
        }
        return user;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
