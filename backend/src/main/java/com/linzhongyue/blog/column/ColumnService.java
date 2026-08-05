package com.linzhongyue.blog.column;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.linzhongyue.blog.article.entity.Article;
import com.linzhongyue.blog.article.mapper.ArticleMapper;
import com.linzhongyue.blog.column.dto.ColumnRequest;
import com.linzhongyue.blog.column.dto.ColumnView;
import com.linzhongyue.blog.column.entity.BlogColumn;
import com.linzhongyue.blog.column.mapper.BlogColumnMapper;
import com.linzhongyue.blog.common.BusinessException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ColumnService {
    private final BlogColumnMapper columnMapper;
    private final ArticleMapper articleMapper;

    public ColumnService(BlogColumnMapper columnMapper, ArticleMapper articleMapper) {
        this.columnMapper = columnMapper;
        this.articleMapper = articleMapper;
    }

    @Cacheable(value = "columns", key = "'public'")
    public List<ColumnView> publicList() {
        return columnMapper.selectList(new LambdaQueryWrapper<BlogColumn>()
                        .orderByDesc(BlogColumn::getSortOrder).orderByAsc(BlogColumn::getId)).stream()
                .map(column -> view(column, true)).filter(column -> column.articleCount() > 0).toList();
    }

    @Cacheable(value = "columns", key = "'public-detail:'+#slug")
    public ColumnView publicDetail(String slug) {
        BlogColumn column = columnMapper.selectOne(new LambdaQueryWrapper<BlogColumn>().eq(BlogColumn::getSlug, slug));
        if (column == null) {
            throw BusinessException.notFound("专栏不存在");
        }
        return view(column, true);
    }

    public List<ColumnView> adminList() {
        return columnMapper.selectList(new LambdaQueryWrapper<BlogColumn>()
                        .orderByDesc(BlogColumn::getSortOrder).orderByAsc(BlogColumn::getId)).stream()
                .map(column -> view(column, false)).toList();
    }

    @Transactional
    @CacheEvict(value = {"columns", "articleList", "articleDetail", "dashboard"}, allEntries = true)
    public ColumnView create(ColumnRequest request) {
        BlogColumn column = new BlogColumn();
        column.setSlug(generateSlug(request.nameEn()));
        column.setSortOrder(nextSortOrder());
        apply(column, request);
        column.setCreatedAt(LocalDateTime.now());
        column.setUpdatedAt(LocalDateTime.now());
        columnMapper.insert(column);
        return view(column, false);
    }

    @Transactional
    @CacheEvict(value = {"columns", "articleList", "articleDetail", "dashboard"}, allEntries = true)
    public ColumnView update(Long id, ColumnRequest request) {
        BlogColumn column = require(id);
        apply(column, request);
        column.setUpdatedAt(LocalDateTime.now());
        columnMapper.updateById(column);
        return view(column, false);
    }

    @Transactional
    @CacheEvict(value = {"columns", "articleList", "articleDetail", "dashboard"}, allEntries = true)
    public void reorder(List<Long> ids) {
        if (ids == null || ids.isEmpty() || new HashSet<>(ids).size() != ids.size()) {
            throw BusinessException.badRequest("专栏顺序不完整或包含重复项");
        }
        long total = columnMapper.selectCount(null);
        if (total != ids.size() || columnMapper.selectBatchIds(ids).size() != ids.size()) {
            throw BusinessException.badRequest("请提交全部专栏的完整顺序");
        }
        LocalDateTime now = LocalDateTime.now();
        for (int index = 0; index < ids.size(); index++) {
            columnMapper.update(null, new LambdaUpdateWrapper<BlogColumn>()
                    .eq(BlogColumn::getId, ids.get(index))
                    .set(BlogColumn::getSortOrder, (ids.size() - index) * 10)
                    .set(BlogColumn::getUpdatedAt, now));
        }
    }

    @Transactional
    @CacheEvict(value = {"columns", "articleList", "articleDetail", "dashboard"}, allEntries = true)
    public void delete(Long id) {
        require(id);
        articleMapper.update(null, new LambdaUpdateWrapper<Article>()
                .eq(Article::getColumnId, id).set(Article::getColumnId, null));
        columnMapper.deleteById(id);
    }

    public BlogColumn require(Long id) {
        BlogColumn column = columnMapper.selectById(id);
        if (column == null) {
            throw BusinessException.notFound("专栏不存在");
        }
        return column;
    }

    private void apply(BlogColumn column, ColumnRequest request) {
        column.setNameZh(request.nameZh().trim());
        column.setNameEn(request.nameEn().trim());
        column.setDescriptionZh(request.descriptionZh() == null ? "" : request.descriptionZh().trim());
        column.setDescriptionEn(request.descriptionEn() == null ? "" : request.descriptionEn().trim());
        column.setStatus(request.status());
    }

    private int nextSortOrder() {
        BlogColumn first = columnMapper.selectOne(new LambdaQueryWrapper<BlogColumn>()
                .orderByDesc(BlogColumn::getSortOrder).last("LIMIT 1"));
        return first == null || first.getSortOrder() == null ? 10 : first.getSortOrder() + 10;
    }

    private String generateSlug(String englishName) {
        String base = englishName == null ? "" : englishName.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-").replaceAll("(^-+|-+$)", "");
        if (base.isBlank()) {
            base = "column";
        }
        String candidate = base;
        while (columnMapper.selectCount(new LambdaQueryWrapper<BlogColumn>().eq(BlogColumn::getSlug, candidate)) > 0) {
            candidate = base + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
        }
        return candidate;
    }

    private ColumnView view(BlogColumn column, boolean publishedOnly) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<Article>()
                .eq(Article::getColumnId, column.getId());
        if (publishedOnly) {
            wrapper.eq(Article::getStatus, "PUBLISHED");
        }
        List<Article> articles = articleMapper.selectList(wrapper.select(Article::getPublishedAt));
        LocalDateTime latest = articles.stream().map(Article::getPublishedAt)
                .filter(value -> value != null).max(LocalDateTime::compareTo).orElse(null);
        return new ColumnView(column.getId(), column.getSlug(), column.getNameZh(), column.getNameEn(),
                column.getDescriptionZh(), column.getDescriptionEn(), column.getStatus(), column.getSortOrder(),
                articles.size(), latest, column.getUpdatedAt());
    }

}
