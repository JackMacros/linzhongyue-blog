package com.linzhongyue.blog.dashboard;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.linzhongyue.blog.article.entity.Article;
import com.linzhongyue.blog.article.mapper.ArticleMapper;
import com.linzhongyue.blog.column.mapper.BlogColumnMapper;
import com.linzhongyue.blog.dashboard.dto.DashboardView;
import com.linzhongyue.blog.statistics.entity.DailyVisitStat;
import com.linzhongyue.blog.statistics.mapper.DailyVisitStatMapper;
import com.linzhongyue.blog.tag.mapper.TagMapper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    private final ArticleMapper articleMapper;
    private final TagMapper tagMapper;
    private final BlogColumnMapper columnMapper;
    private final DailyVisitStatMapper visitStatMapper;

    public DashboardService(ArticleMapper articleMapper, TagMapper tagMapper,
                            BlogColumnMapper columnMapper, DailyVisitStatMapper visitStatMapper) {
        this.articleMapper = articleMapper;
        this.tagMapper = tagMapper;
        this.columnMapper = columnMapper;
        this.visitStatMapper = visitStatMapper;
    }

    @Cacheable(value = "dashboard", key = "'summary'")
    public DashboardView summary() {
        long articleCount = articleMapper.selectCount(null);
        long publishedCount = articleMapper.selectCount(new LambdaQueryWrapper<Article>().eq(Article::getStatus, "PUBLISHED"));
        long draftCount = articleMapper.selectCount(new LambdaQueryWrapper<Article>().eq(Article::getStatus, "DRAFT"));
        List<Article> allArticles = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .select(Article::getViewCount));
        long totalViews = allArticles.stream().map(Article::getViewCount).filter(value -> value != null)
                .mapToLong(Long::longValue).sum();

        List<Article> top = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, "PUBLISHED").orderByDesc(Article::getViewCount).last("LIMIT 5"));
        List<Article> drafts = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, "DRAFT").orderByDesc(Article::getUpdatedAt).last("LIMIT 5"));

        return new DashboardView(articleCount, publishedCount, draftCount,
                tagMapper.selectCount(null), columnMapper.selectCount(null), totalViews,
                trend(),
                top.stream().map(article -> new DashboardView.TopArticle(article.getId(), article.getTitle(),
                        article.getSlug(), article.getViewCount() == null ? 0 : article.getViewCount())).toList(),
                drafts.stream().map(article -> new DashboardView.DraftItem(article.getId(), article.getTitle(),
                        article.getUpdatedAt())).toList());
    }

    private List<DashboardView.TrendPoint> trend() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);
        Map<LocalDate, DailyVisitStat> values = visitStatMapper.selectList(new LambdaQueryWrapper<DailyVisitStat>()
                        .between(DailyVisitStat::getStatDate, start, end)).stream()
                .collect(Collectors.toMap(DailyVisitStat::getStatDate, Function.identity()));
        List<DashboardView.TrendPoint> result = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            DailyVisitStat value = values.get(date);
            result.add(new DashboardView.TrendPoint(date,
                    value == null || value.getPv() == null ? 0 : value.getPv(),
                    value == null || value.getUv() == null ? 0 : value.getUv()));
        }
        return result;
    }
}

