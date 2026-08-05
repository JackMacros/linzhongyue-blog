package com.linzhongyue.blog.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.router.SaRouter;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final BlogProperties properties;
    private final OriginInterceptor originInterceptor;

    public WebConfig(BlogProperties properties, OriginInterceptor originInterceptor) {
        this.properties = properties;
        this.originInterceptor = originInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(originInterceptor)
                .addPathPatterns("/api/admin/**", "/api/auth/**");
        registry.addInterceptor(new SaInterceptor(handler ->
                        SaRouter.match("/api/admin/**", route -> StpUtil.checkLogin())))
                .addPathPatterns("/**")
                .excludePathPatterns("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if (!properties.getAllowedOrigins().isEmpty()) {
            registry.addMapping("/api/**")
                    .allowedOrigins(properties.getAllowedOrigins().toArray(String[]::new))
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
        }
    }
}
