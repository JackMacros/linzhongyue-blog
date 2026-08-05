package com.linzhongyue.blog.config;

import com.linzhongyue.blog.common.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Set;

@Component
public class OriginInterceptor implements HandlerInterceptor {
    private static final Set<String> SAFE_METHODS = Set.of("GET", "HEAD", "OPTIONS");
    private final BlogProperties properties;

    public OriginInterceptor(BlogProperties properties) {
        this.properties = properties;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (SAFE_METHODS.contains(request.getMethod())) {
            return true;
        }
        String origin = request.getHeader("Origin");
        if (origin == null || origin.isBlank()) {
            return true;
        }
        String currentOrigin = request.getScheme() + "://" + request.getServerName()
                + (isDefaultPort(request) ? "" : ":" + request.getServerPort());
        if (origin.equalsIgnoreCase(currentOrigin) || properties.getAllowedOrigins().stream()
                .anyMatch(value -> value.equalsIgnoreCase(origin))) {
            return true;
        }
        throw new BusinessException(40300, org.springframework.http.HttpStatus.FORBIDDEN, "请求来源未被允许");
    }

    private boolean isDefaultPort(HttpServletRequest request) {
        return ("http".equalsIgnoreCase(request.getScheme()) && request.getServerPort() == 80)
                || ("https".equalsIgnoreCase(request.getScheme()) && request.getServerPort() == 443);
    }
}
