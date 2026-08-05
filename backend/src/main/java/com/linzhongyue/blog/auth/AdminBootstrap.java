package com.linzhongyue.blog.auth;

import com.linzhongyue.blog.auth.entity.AdminUser;
import com.linzhongyue.blog.auth.mapper.AdminUserMapper;
import com.linzhongyue.blog.config.BlogProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
public class AdminBootstrap implements ApplicationRunner {
    private final AdminUserMapper mapper;
    private final PasswordEncoder passwordEncoder;
    private final BlogProperties properties;

    public AdminBootstrap(AdminUserMapper mapper, PasswordEncoder passwordEncoder, BlogProperties properties) {
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (mapper.selectCount(null) > 0) {
            return;
        }
        BlogProperties.AdminBootstrap bootstrap = properties.getAdminBootstrap();
        if (bootstrap.getPassword() == null || bootstrap.getPassword().isBlank()) {
            log.warn("No administrator exists. Set BLOG_ADMIN_PASSWORD and restart once to create it.");
            return;
        }
        AdminUser user = new AdminUser();
        user.setUsername(bootstrap.getUsername().trim());
        user.setPasswordHash(passwordEncoder.encode(bootstrap.getPassword()));
        user.setNickname(bootstrap.getNickname().trim());
        user.setEmail(bootstrap.getEmail() == null || bootstrap.getEmail().isBlank() ? null : bootstrap.getEmail().trim());
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        mapper.insert(user);
        log.info("Initial administrator '{}' created", user.getUsername());
    }
}
