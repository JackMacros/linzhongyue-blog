package com.linzhongyue.blog.column.dto;

import java.time.LocalDateTime;

public record ColumnView(
        Long id,
        String slug,
        String nameZh,
        String nameEn,
        String descriptionZh,
        String descriptionEn,
        String status,
        Integer sortOrder,
        long articleCount,
        LocalDateTime latestPublishedAt,
        LocalDateTime updatedAt
) {
}

