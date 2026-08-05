package com.linzhongyue.blog.tag;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.linzhongyue.blog.article.entity.Article;
import com.linzhongyue.blog.article.entity.ArticleTag;
import com.linzhongyue.blog.article.mapper.ArticleMapper;
import com.linzhongyue.blog.article.mapper.ArticleTagMapper;
import com.linzhongyue.blog.common.BusinessException;
import com.linzhongyue.blog.tag.dto.TagRequest;
import com.linzhongyue.blog.tag.dto.TagView;
import com.linzhongyue.blog.tag.entity.Tag;
import com.linzhongyue.blog.tag.mapper.TagMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class TagService {
    private final TagMapper tagMapper;
    private final ArticleTagMapper articleTagMapper;
    private final ArticleMapper articleMapper;

    public TagService(TagMapper tagMapper, ArticleTagMapper articleTagMapper, ArticleMapper articleMapper) {
        this.tagMapper = tagMapper;
        this.articleTagMapper = articleTagMapper;
        this.articleMapper = articleMapper;
    }

    @Cacheable(value = "tags", key = "'public'")
    public List<TagView> publicList() {
        List<Tag> tags = tagMapper.selectList(new LambdaQueryWrapper<Tag>().orderByAsc(Tag::getName));
        Set<Long> publishedIds = new HashSet<>(articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .select(Article::getId).eq(Article::getStatus, "PUBLISHED")).stream().map(Article::getId).toList());
        return toViews(tags, publishedIds, true);
    }

    public List<TagView> adminList() {
        return toViews(tagMapper.selectList(new LambdaQueryWrapper<Tag>().orderByAsc(Tag::getName)), Set.of(), false);
    }

    @Transactional
    @CacheEvict(value = {"tags", "articleList", "articleDetail", "dashboard"}, allEntries = true)
    public TagView create(TagRequest request) {
        ensureUnique(request.name().trim(), null);
        Tag tag = new Tag();
        tag.setName(request.name().trim());
        tag.setColor(request.color().toLowerCase());
        tag.setCreatedAt(LocalDateTime.now());
        tag.setUpdatedAt(LocalDateTime.now());
        tagMapper.insert(tag);
        return new TagView(tag.getId(), tag.getName(), tag.getColor(), 0);
    }

    @Transactional
    @CacheEvict(value = {"tags", "articleList", "articleDetail", "dashboard"}, allEntries = true)
    public TagView update(Long id, TagRequest request) {
        Tag tag = require(id);
        ensureUnique(request.name().trim(), id);
        tag.setName(request.name().trim());
        tag.setColor(request.color().toLowerCase());
        tag.setUpdatedAt(LocalDateTime.now());
        tagMapper.updateById(tag);
        long count = articleTagMapper.selectCount(new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getTagId, id));
        return new TagView(id, tag.getName(), tag.getColor(), count);
    }

    @Transactional
    @CacheEvict(value = {"tags", "articleList", "articleDetail", "dashboard"}, allEntries = true)
    public void delete(Long id, boolean force) {
        require(id);
        long count = articleTagMapper.selectCount(new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getTagId, id));
        if (count > 0 && !force) {
            throw BusinessException.conflict("标签正在被 " + count + " 篇文章使用，请确认后强制删除");
        }
        articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getTagId, id));
        tagMapper.deleteById(id);
    }

    private List<TagView> toViews(List<Tag> tags, Set<Long> publishedIds, boolean publishedOnly) {
        List<TagView> result = new ArrayList<>();
        for (Tag tag : tags) {
            List<ArticleTag> relations = articleTagMapper.selectList(new LambdaQueryWrapper<ArticleTag>()
                    .eq(ArticleTag::getTagId, tag.getId()));
            long count = publishedOnly
                    ? relations.stream().filter(relation -> publishedIds.contains(relation.getArticleId())).count()
                    : relations.size();
            if (!publishedOnly || count > 0) {
                result.add(new TagView(tag.getId(), tag.getName(), tag.getColor(), count));
            }
        }
        return result;
    }

    private Tag require(Long id) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null) {
            throw BusinessException.notFound("标签不存在");
        }
        return tag;
    }

    private void ensureUnique(String name, Long excludeId) {
        Tag existing = tagMapper.selectOne(new LambdaQueryWrapper<Tag>().eq(Tag::getName, name));
        if (existing != null && !existing.getId().equals(excludeId)) {
            throw BusinessException.conflict("标签名称已存在");
        }
    }
}

