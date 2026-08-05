package com.linzhongyue.blog.media;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.linzhongyue.blog.article.entity.Article;
import com.linzhongyue.blog.article.mapper.ArticleMapper;
import com.linzhongyue.blog.auth.entity.AdminUser;
import com.linzhongyue.blog.auth.mapper.AdminUserMapper;
import com.linzhongyue.blog.common.BusinessException;
import com.linzhongyue.blog.common.PageResponse;
import com.linzhongyue.blog.media.entity.MediaAsset;
import com.linzhongyue.blog.media.mapper.MediaAssetMapper;
import com.linzhongyue.blog.site.entity.PortfolioProject;
import com.linzhongyue.blog.site.entity.SiteProfile;
import com.linzhongyue.blog.site.mapper.PortfolioProjectMapper;
import com.linzhongyue.blog.site.mapper.SiteProfileMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class MediaService {
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private final MediaAssetMapper mediaMapper;
    private final ArticleMapper articleMapper;
    private final PortfolioProjectMapper projectMapper;
    private final SiteProfileMapper profileMapper;
    private final AdminUserMapper adminUserMapper;
    private final QiniuClient qiniuClient;

    public MediaService(MediaAssetMapper mediaMapper, ArticleMapper articleMapper,
                        PortfolioProjectMapper projectMapper, SiteProfileMapper profileMapper,
                        AdminUserMapper adminUserMapper, QiniuClient qiniuClient) {
        this.mediaMapper = mediaMapper;
        this.articleMapper = articleMapper;
        this.projectMapper = projectMapper;
        this.profileMapper = profileMapper;
        this.adminUserMapper = adminUserMapper;
        this.qiniuClient = qiniuClient;
    }

    public PageResponse<MediaAsset> list(long page, long pageSize, String keyword) {
        LambdaQueryWrapper<MediaAsset> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(MediaAsset::getOriginalName, keyword.trim());
        }
        wrapper.orderByDesc(MediaAsset::getCreatedAt);
        Page<MediaAsset> result = mediaMapper.selectPage(new Page<>(page, pageSize), wrapper);
        return PageResponse.of(result, result.getRecords());
    }

    @Transactional
    public MediaAsset upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw BusinessException.badRequest("请选择要上传的图片");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw BusinessException.badRequest("只允许上传 JPG、PNG、WebP 或 GIF 图片");
        }
        if (file.getSize() > 10 * 1024 * 1024L) {
            throw BusinessException.badRequest("图片不能超过 10MB");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException exception) {
            throw BusinessException.badRequest("读取上传文件失败");
        }
        String contentHash = sha256(bytes);
        MediaAsset existing = mediaMapper.selectOne(new LambdaQueryWrapper<MediaAsset>()
                .eq(MediaAsset::getContentHash, contentHash));
        if (existing != null) {
            return existing;
        }
        String extension = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> "";
        };
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        String key = "blog/" + date + "/" + UUID.randomUUID().toString().replace("-", "") + extension;
        qiniuClient.upload(bytes, key);
        MediaAsset asset = new MediaAsset();
        asset.setQiniuKey(key);
        asset.setUrl(qiniuClient.publicUrl(key));
        asset.setOriginalName(file.getOriginalFilename() == null ? "image" + extension : file.getOriginalFilename());
        asset.setMimeType(contentType);
        asset.setSizeBytes(file.getSize());
        asset.setContentHash(contentHash);
        asset.setCreatedAt(LocalDateTime.now());
        try {
            mediaMapper.insert(asset);
        } catch (RuntimeException exception) {
            try { qiniuClient.delete(key); } catch (RuntimeException ignored) { }
            throw exception;
        }
        return asset;
    }

    private String sha256(byte[] bytes) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(bytes);
            StringBuilder result = new StringBuilder(digest.length * 2);
            for (byte value : digest) {
                result.append(String.format("%02x", value));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    @Transactional
    public void delete(Long id) {
        MediaAsset asset = mediaMapper.selectById(id);
        if (asset == null) {
            throw BusinessException.notFound("素材不存在");
        }
        String url = asset.getUrl();
        long articleReferences = articleMapper.selectCount(new LambdaQueryWrapper<Article>()
                .and(wrapper -> wrapper.like(Article::getContent, url).or().eq(Article::getCoverUrl, url)));
        long projectReferences = projectMapper.selectCount(new LambdaQueryWrapper<PortfolioProject>().eq(PortfolioProject::getImageUrl, url));
        long profileReferences = profileMapper.selectCount(new LambdaQueryWrapper<SiteProfile>().eq(SiteProfile::getAvatarUrl, url));
        long adminReferences = adminUserMapper.selectCount(new LambdaQueryWrapper<AdminUser>().eq(AdminUser::getAvatarUrl, url));
        long references = articleReferences + projectReferences + profileReferences + adminReferences;
        if (references > 0) {
            throw BusinessException.conflict("该图片仍被 " + references + " 处内容引用，请先移除引用");
        }
        qiniuClient.delete(asset.getQiniuKey());
        mediaMapper.deleteById(id);
    }
}
