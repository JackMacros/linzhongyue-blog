package com.linzhongyue.blog.media;

import com.linzhongyue.blog.common.BusinessException;
import com.linzhongyue.blog.config.BlogProperties;
import com.qiniu.common.QiniuException;
import com.qiniu.http.Response;
import com.qiniu.storage.BucketManager;
import com.qiniu.storage.Configuration;
import com.qiniu.storage.Region;
import com.qiniu.storage.UploadManager;
import com.qiniu.util.Auth;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class QiniuClient {
    private final BlogProperties.Qiniu properties;

    public QiniuClient(BlogProperties blogProperties) {
        this.properties = blogProperties.getQiniu();
    }

    public void upload(byte[] bytes, String key) {
        ensureConfigured();
        try {
            Configuration configuration = configuration();
            Auth auth = Auth.create(properties.getAccessKey(), properties.getSecretKey());
            String token = auth.uploadToken(properties.getBucket(), key);
            Response response = new UploadManager(configuration).put(bytes, key, token);
            if (!response.isOK()) {
                throw BusinessException.serviceUnavailable("七牛云上传失败：" + response.error);
            }
        } catch (QiniuException exception) {
            throw BusinessException.serviceUnavailable("七牛云上传失败：" + exception.response);
        }
    }

    public void delete(String key) {
        ensureConfigured();
        try {
            Auth auth = Auth.create(properties.getAccessKey(), properties.getSecretKey());
            new BucketManager(auth, configuration()).delete(properties.getBucket(), key);
        } catch (QiniuException exception) {
            throw BusinessException.serviceUnavailable("七牛云删除失败：" + exception.response);
        }
    }

    public String publicUrl(String key) {
        ensureConfigured();
        String domain = properties.getDomain().trim().replaceAll("/+$", "");
        return domain + "/" + key;
    }

    public String domain() {
        return properties.getDomain();
    }

    private Configuration configuration() {
        Region region = switch (properties.getZone().toLowerCase()) {
            case "z0", "east" -> Region.region0();
            case "z1", "north" -> Region.region1();
            case "z2", "south" -> Region.region2();
            case "na0", "north-america" -> Region.regionNa0();
            case "as0", "asia" -> Region.regionAs0();
            default -> Region.autoRegion();
        };
        return new Configuration(region);
    }

    private void ensureConfigured() {
        if (isBlank(properties.getAccessKey()) || isBlank(properties.getSecretKey())
                || isBlank(properties.getBucket()) || isBlank(properties.getDomain())) {
            throw BusinessException.serviceUnavailable("七牛云尚未配置，请设置 BLOG_QINIU_* 环境变量");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}

