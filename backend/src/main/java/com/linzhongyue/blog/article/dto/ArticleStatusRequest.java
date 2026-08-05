package com.linzhongyue.blog.article.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDateTime;

public record ArticleStatusRequest(
        @NotBlank @Pattern(regexp = "DRAFT|PUBLISHED", message = "文章状态不正确") String status,
        LocalDateTime publishedAt
) {
}

