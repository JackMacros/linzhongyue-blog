package com.linzhongyue.blog.article;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.linzhongyue.blog.article.dto.ArticleColumnView;
import com.linzhongyue.blog.article.dto.ArticleDetail;
import com.linzhongyue.blog.article.dto.ArticleRequest;
import com.linzhongyue.blog.article.dto.ArticleStatusRequest;
import com.linzhongyue.blog.article.dto.ArticleSummary;
import com.linzhongyue.blog.article.entity.Article;
import com.linzhongyue.blog.article.entity.ArticleTag;
import com.linzhongyue.blog.article.mapper.ArticleMapper;
import com.linzhongyue.blog.article.mapper.ArticleTagMapper;
import com.linzhongyue.blog.column.entity.BlogColumn;
import com.linzhongyue.blog.column.mapper.BlogColumnMapper;
import com.linzhongyue.blog.common.BusinessException;
import com.linzhongyue.blog.common.PageResponse;
import com.linzhongyue.blog.tag.dto.TagView;
import com.linzhongyue.blog.tag.entity.Tag;
import com.linzhongyue.blog.tag.mapper.TagMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ArticleService {
    private static final Pattern DISALLOWED_HTML = Pattern.compile(
            "(?is)<\\s*/?\\s*(iframe|div|script|style|object|embed)\\b");

    private final ArticleMapper articleMapper;
    private final ArticleTagMapper articleTagMapper;
    private final TagMapper tagMapper;
    private final BlogColumnMapper columnMapper;

    public ArticleService(ArticleMapper articleMapper, ArticleTagMapper articleTagMapper,
                          TagMapper tagMapper, BlogColumnMapper columnMapper) {
        this.articleMapper = articleMapper;
        this.articleTagMapper = articleTagMapper;
        this.tagMapper = tagMapper;
        this.columnMapper = columnMapper;
    }

    @Cacheable(value = "articleList", key = "'public:'+#page+':'+#pageSize+':'+#keyword+':'+#tag+':'+#column")
    public PageResponse<ArticleSummary> publicList(long page, long pageSize, String keyword, String tag, String column) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, "PUBLISHED")
                .le(Article::getPublishedAt, LocalDateTime.now());

        if (StringUtils.hasText(keyword)) {
            String normalized = keyword.trim();
            wrapper.and(query -> query.like(Article::getTitle, normalized).or().like(Article::getSummary, normalized));
        }
        if (StringUtils.hasText(column)) {
            BlogColumn selectedColumn = columnMapper.selectOne(new LambdaQueryWrapper<BlogColumn>()
                    .eq(BlogColumn::getSlug, column.trim()));
            if (selectedColumn == null) {
                return new PageResponse<>(List.of(), page, pageSize, 0);
            }
            wrapper.eq(Article::getColumnId, selectedColumn.getId());
        }
        if (StringUtils.hasText(tag)) {
            Tag selectedTag = tagMapper.selectOne(new LambdaQueryWrapper<Tag>().eq(Tag::getName, tag.trim()));
            if (selectedTag == null) {
                return new PageResponse<>(List.of(), page, pageSize, 0);
            }
            List<Long> ids = articleTagMapper.selectList(new LambdaQueryWrapper<ArticleTag>()
                            .eq(ArticleTag::getTagId, selectedTag.getId())).stream()
                    .map(ArticleTag::getArticleId).toList();
            if (ids.isEmpty()) {
                return new PageResponse<>(List.of(), page, pageSize, 0);
            }
            wrapper.in(Article::getId, ids);
        }
        wrapper.orderByDesc(Article::getPublishedAt).orderByDesc(Article::getId);
        Page<Article> result = articleMapper.selectPage(new Page<>(page, pageSize), wrapper);
        return PageResponse.of(result, summaries(result.getRecords()));
    }

    @Cacheable(value = "latestArticles", key = "#limit")
    public List<ArticleSummary> latest(int limit) {
        List<Article> articles = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, "PUBLISHED")
                .le(Article::getPublishedAt, LocalDateTime.now())
                .orderByDesc(Article::getPublishedAt)
                .last("LIMIT " + Math.min(Math.max(limit, 1), 20)));
        return summaries(articles);
    }

    @Cacheable(value = "articleDetail", key = "#slug")
    public ArticleDetail publicDetail(String slug) {
        Article article = articleMapper.selectOne(new LambdaQueryWrapper<Article>()
                .eq(Article::getSlug, slug)
                .eq(Article::getStatus, "PUBLISHED")
                .le(Article::getPublishedAt, LocalDateTime.now()));
        if (article == null) {
            throw BusinessException.notFound("文章不存在或尚未发布");
        }
        return detail(article, true);
    }

    public PageResponse<ArticleSummary> adminList(long page, long pageSize, String keyword,
                                                   String status, Long columnId, Long tagId) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(query -> query.like(Article::getTitle, keyword.trim())
                    .or().like(Article::getSummary, keyword.trim()));
        }
        wrapper.eq(StringUtils.hasText(status), Article::getStatus, status)
                .eq(columnId != null, Article::getColumnId, columnId);
        if (tagId != null) {
            List<Long> ids = articleTagMapper.selectList(new LambdaQueryWrapper<ArticleTag>()
                            .eq(ArticleTag::getTagId, tagId)).stream()
                    .map(ArticleTag::getArticleId).toList();
            if (ids.isEmpty()) {
                return new PageResponse<>(List.of(), page, pageSize, 0);
            }
            wrapper.in(Article::getId, ids);
        }
        wrapper.orderByDesc(Article::getUpdatedAt).orderByDesc(Article::getId);
        Page<Article> result = articleMapper.selectPage(new Page<>(page, pageSize), wrapper);
        return PageResponse.of(result, summaries(result.getRecords()));
    }

    public ArticleDetail adminDetail(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw BusinessException.notFound("文章不存在");
        }
        return detail(article, false);
    }

    @Transactional
    @CacheEvict(value = {"articleDetail", "articleList", "latestArticles", "tags", "columns", "dashboard"}, allEntries = true)
    public ArticleDetail create(ArticleRequest request) {
        validateRequest(request, null);
        Article article = new Article();
        article.setSlug(generateSlug());
        apply(article, request);
        article.setViewCount(0L);
        article.setCreatedAt(LocalDateTime.now());
        article.setUpdatedAt(LocalDateTime.now());
        articleMapper.insert(article);
        replaceTags(article.getId(), request.tagIds());
        return detail(article, false);
    }

    @Transactional
    @CacheEvict(value = {"articleDetail", "articleList", "latestArticles", "tags", "columns", "dashboard"}, allEntries = true)
    public ArticleDetail update(Long id, ArticleRequest request) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw BusinessException.notFound("文章不存在");
        }
        validateRequest(request, id);
        apply(article, request);
        article.setUpdatedAt(LocalDateTime.now());
        articleMapper.updateById(article);
        replaceTags(id, request.tagIds());
        return detail(article, false);
    }

    @Transactional
    @CacheEvict(value = {"articleDetail", "articleList", "latestArticles", "tags", "columns", "dashboard"}, allEntries = true)
    public ArticleDetail changeStatus(Long id, ArticleStatusRequest request) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw BusinessException.notFound("文章不存在");
        }
        article.setStatus(request.status());
        if ("PUBLISHED".equals(request.status())) {
            article.setPublishedAt(request.publishedAt() == null
                    ? (article.getPublishedAt() == null ? LocalDateTime.now() : article.getPublishedAt())
                    : request.publishedAt());
        }
        article.setUpdatedAt(LocalDateTime.now());
        articleMapper.updateById(article);
        return detail(article, false);
    }

    @Transactional
    @CacheEvict(value = {"articleDetail", "articleList", "latestArticles", "tags", "columns", "dashboard"}, allEntries = true)
    public void delete(Long id) {
        if (articleMapper.selectById(id) == null) {
            throw BusinessException.notFound("文章不存在");
        }
        articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getArticleId, id));
        articleMapper.deleteById(id);
    }

    public void incrementView(String slug) {
        if (articleMapper.incrementViewCount(slug) == 0) {
            throw BusinessException.notFound("文章不存在或尚未发布");
        }
    }

    private void validateRequest(ArticleRequest request, Long excludeId) {
        if (request.columnId() != null && columnMapper.selectById(request.columnId()) == null) {
            throw BusinessException.badRequest("所选专栏不存在");
        }
        Set<Long> tagIds = new LinkedHashSet<>(request.tagIds() == null ? List.of() : request.tagIds());
        if (!tagIds.isEmpty() && tagMapper.selectBatchIds(tagIds).size() != tagIds.size()) {
            throw BusinessException.badRequest("包含不存在的标签");
        }
        if (DISALLOWED_HTML.matcher(request.content()).find()) {
            throw BusinessException.badRequest("Markdown 正文不允许 iframe、div、script、style、object 或 embed 原始 HTML");
        }
    }

    private void apply(Article article, ArticleRequest request) {
        article.setTitle(request.title().trim());
        article.setSummary(request.summary() == null ? "" : request.summary().trim());
        article.setCoverUrl(request.coverUrl() == null ? "" : request.coverUrl().trim());
        article.setContent(request.content());
        article.setColumnId(request.columnId());
        article.setStatus(request.status());
        if ("PUBLISHED".equals(request.status())) {
            article.setPublishedAt(request.publishedAt() == null
                    ? (article.getPublishedAt() == null ? LocalDateTime.now() : article.getPublishedAt())
                    : request.publishedAt());
        } else {
            article.setPublishedAt(request.publishedAt());
        }
        int visibleCharacters = request.content().replaceAll("(?s)```.*?```", "")
                .replaceAll("[#>*_`~\\-\\[\\]()]", "").replaceAll("\\s+", "").length();
        article.setReadMinutes(Math.max(1, (int) Math.ceil(visibleCharacters / 400.0)));
    }

    private String generateSlug() {
        String slug;
        do {
            slug = "article-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        } while (articleMapper.selectCount(new LambdaQueryWrapper<Article>().eq(Article::getSlug, slug)) > 0);
        return slug;
    }

    private void replaceTags(Long articleId, List<Long> requestedTagIds) {
        articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getArticleId, articleId));
        Set<Long> tagIds = new LinkedHashSet<>(requestedTagIds == null ? List.of() : requestedTagIds);
        tagIds.forEach(tagId -> articleTagMapper.insert(new ArticleTag(articleId, tagId)));
    }

    private ArticleDetail detail(Article article, boolean includeRelated) {
        ArticleSummary summary = summaries(List.of(article)).getFirst();
        List<ArticleSummary> related = includeRelated ? related(article) : List.of();
        return new ArticleDetail(summary.id(), summary.slug(), summary.title(), summary.summary(), summary.coverUrl(), article.getContent(),
                summary.status(), summary.column(), summary.tags(), summary.publishedAt(), summary.viewCount(),
                summary.readMinutes(), summary.createdAt(), summary.updatedAt(), related);
    }

    private List<ArticleSummary> related(Article source) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, "PUBLISHED").ne(Article::getId, source.getId())
                .le(Article::getPublishedAt, LocalDateTime.now());
        if (source.getColumnId() != null) {
            wrapper.eq(Article::getColumnId, source.getColumnId());
        } else {
            List<Long> tagIds = articleTagMapper.selectList(new LambdaQueryWrapper<ArticleTag>()
                            .eq(ArticleTag::getArticleId, source.getId())).stream()
                    .map(ArticleTag::getTagId).toList();
            if (tagIds.isEmpty()) {
                return List.of();
            }
            List<Long> articleIds = articleTagMapper.selectList(new LambdaQueryWrapper<ArticleTag>()
                            .in(ArticleTag::getTagId, tagIds)).stream()
                    .map(ArticleTag::getArticleId).distinct().toList();
            wrapper.in(Article::getId, articleIds);
        }
        wrapper.orderByDesc(Article::getPublishedAt).last("LIMIT 3");
        return summaries(articleMapper.selectList(wrapper));
    }

    private List<ArticleSummary> summaries(List<Article> articles) {
        if (articles.isEmpty()) {
            return List.of();
        }
        Set<Long> articleIds = articles.stream().map(Article::getId).collect(Collectors.toSet());
        Set<Long> columnIds = articles.stream().map(Article::getColumnId).filter(id -> id != null).collect(Collectors.toSet());
        Map<Long, BlogColumn> columns = columnIds.isEmpty() ? Map.of() : columnMapper.selectBatchIds(columnIds).stream()
                .collect(Collectors.toMap(BlogColumn::getId, Function.identity()));
        List<ArticleTag> relations = articleTagMapper.selectList(new LambdaQueryWrapper<ArticleTag>()
                .in(ArticleTag::getArticleId, articleIds));
        Set<Long> tagIds = relations.stream().map(ArticleTag::getTagId).collect(Collectors.toSet());
        Map<Long, Tag> tags = tagIds.isEmpty() ? Map.of() : tagMapper.selectBatchIds(tagIds).stream()
                .collect(Collectors.toMap(Tag::getId, Function.identity()));
        Map<Long, List<Long>> tagsByArticle = relations.stream().collect(Collectors.groupingBy(
                ArticleTag::getArticleId, Collectors.mapping(ArticleTag::getTagId, Collectors.toList())));

        List<ArticleSummary> result = new ArrayList<>();
        for (Article article : articles) {
            BlogColumn column = article.getColumnId() == null ? null : columns.get(article.getColumnId());
            ArticleColumnView columnView = column == null ? null
                    : new ArticleColumnView(column.getId(), column.getSlug(), column.getNameZh(), column.getNameEn());
            List<TagView> tagViews = tagsByArticle.getOrDefault(article.getId(), List.of()).stream()
                    .map(tags::get).filter(tag -> tag != null)
                    .sorted(Comparator.comparing(Tag::getName))
                    .map(tag -> new TagView(tag.getId(), tag.getName(), tag.getColor(), 0)).toList();
            result.add(new ArticleSummary(article.getId(), article.getSlug(), article.getTitle(), article.getSummary(),
                    article.getCoverUrl() == null ? "" : article.getCoverUrl(),
                    article.getStatus(), columnView, tagViews, article.getPublishedAt(),
                    article.getViewCount() == null ? 0 : article.getViewCount(),
                    article.getReadMinutes() == null ? 1 : article.getReadMinutes(),
                    article.getCreatedAt(), article.getUpdatedAt()));
        }
        return result;
    }
}
