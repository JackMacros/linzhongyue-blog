package com.linzhongyue.blog.dashboard.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record DashboardView(
        long articleCount,
        long publishedCount,
        long draftCount,
        long tagCount,
        long columnCount,
        long totalViews,
        List<TrendPoint> visitTrend,
        List<TopArticle> topArticles,
        List<DraftItem> latestDrafts
) {
    public record TrendPoint(LocalDate date, long pv, long uv) { }
    public record TopArticle(Long id, String title, String slug, long views) { }
    public record DraftItem(Long id, String title, LocalDateTime updatedAt) { }
}

