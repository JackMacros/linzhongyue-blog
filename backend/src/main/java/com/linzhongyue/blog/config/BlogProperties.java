package com.linzhongyue.blog.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "blog")
public class BlogProperties {
    private AdminBootstrap adminBootstrap = new AdminBootstrap();
    private AuthCookie authCookie = new AuthCookie();
    private List<String> allowedOrigins = new ArrayList<>();
    private Qiniu qiniu = new Qiniu();
    private LegacyMigration legacyMigration = new LegacyMigration();

    @Data
    public static class AdminBootstrap {
        private String username = "admin";
        private String password;
        private String nickname = "林中月";
        private String email;
    }

    @Data
    public static class AuthCookie {
        private boolean secure;
        private String sameSite = "Lax";
    }

    @Data
    public static class Qiniu {
        private String accessKey;
        private String secretKey;
        private String bucket;
        private String domain;
        private String zone = "auto";
    }

    @Data
    public static class LegacyMigration {
        private boolean enabled;
        private String url;
        private String username;
        private String password;
        private String reportDirectory = "migration-reports";
    }
}

