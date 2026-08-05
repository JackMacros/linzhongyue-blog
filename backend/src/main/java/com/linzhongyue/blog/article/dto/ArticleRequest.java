package com.linzhongyue.blog.article.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public record ArticleRequest(
        @NotBlank(message = "文章标题不能为空") @Size(max = 255, message = "标题不能超过 255 个字符") String title,
        @Size(max = 1000, message = "摘要不能超过 1000 个字符") String summary,
        @Size(max = 1000, message = "封面链接不能超过 1000 个字符") String coverUrl,
        @NotBlank(message = "Markdown 正文不能为空") String content,
        Long columnId,
        @Size(max = 20, message = "一篇文章最多设置 20 个标签") List<Long> tagIds,
        @NotBlank(message = "文章状态不能为空")
        @Pattern(regexp = "DRAFT|PUBLISHED", message = "文章状态不正确") String status,
        LocalDateTime publishedAt
) {
}
