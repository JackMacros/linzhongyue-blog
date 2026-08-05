package com.linzhongyue.blog.article.dto;

import com.linzhongyue.blog.tag.dto.TagView;

import java.time.LocalDateTime;
import java.util.List;

public record ArticleDetail(
        Long id,
        String slug,
        String title,
        String summary,
        String coverUrl,
        String content,
        String status,
        ArticleColumnView column,
        List<TagView> tags,
        LocalDateTime publishedAt,
        long viewCount,
        int readMinutes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<ArticleSummary> related
) {
}
