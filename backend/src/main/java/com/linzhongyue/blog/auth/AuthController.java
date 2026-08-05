package com.linzhongyue.blog.auth;

import cn.dev33.satoken.config.SaTokenConfig;
import cn.dev33.satoken.stp.StpUtil;
import com.linzhongyue.blog.auth.dto.AdminView;
import com.linzhongyue.blog.auth.dto.LoginRequest;
import com.linzhongyue.blog.auth.dto.PasswordRequest;
import com.linzhongyue.blog.auth.dto.ProfileRequest;
import com.linzhongyue.blog.common.ApiResponse;
import com.linzhongyue.blog.config.BlogProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final SaTokenConfig saTokenConfig;
    private final BlogProperties properties;

    public AuthController(AuthService authService, SaTokenConfig saTokenConfig, BlogProperties properties) {
        this.authService = authService;
        this.saTokenConfig = saTokenConfig;
        this.properties = properties;
    }

    @PostMapping("/login")
    public ApiResponse<AdminView> login(@Valid @RequestBody LoginRequest request,
                                        HttpServletRequest servletRequest,
                                        HttpServletResponse servletResponse) {
        String clientKey = servletRequest.getRemoteAddr();
        AdminView view = authService.login(request, clientKey);
        writeAuthCookie(servletResponse, StpUtil.getTokenValue(), Duration.ofSeconds(saTokenConfig.getTimeout()));
        return ApiResponse.ok(view);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletResponse response) {
        if (StpUtil.isLogin()) {
            StpUtil.logout();
        }
        writeAuthCookie(response, "", Duration.ZERO);
        return ApiResponse.ok();
    }

    @GetMapping("/me")
    public ApiResponse<AdminView> me() {
        StpUtil.checkLogin();
        return ApiResponse.ok(authService.current());
    }

    @PutMapping("/profile")
    public ApiResponse<AdminView> updateProfile(@Valid @RequestBody ProfileRequest request) {
        StpUtil.checkLogin();
        return ApiResponse.ok(authService.updateProfile(request));
    }

    @PutMapping("/password")
    public ApiResponse<Void> updatePassword(@Valid @RequestBody PasswordRequest request,
                                            HttpServletResponse response) {
        StpUtil.checkLogin();
        authService.updatePassword(request);
        writeAuthCookie(response, "", Duration.ZERO);
        return ApiResponse.ok();
    }

    private void writeAuthCookie(HttpServletResponse response, String token, Duration maxAge) {
        ResponseCookie cookie = ResponseCookie.from(saTokenConfig.getTokenName(), token)
                .httpOnly(true)
                .secure(properties.getAuthCookie().isSecure())
                .sameSite(properties.getAuthCookie().getSameSite())
                .path("/")
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}

