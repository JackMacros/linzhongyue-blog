package com.linzhongyue.blog.article.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.linzhongyue.blog.article.entity.Article;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

public interface ArticleMapper extends BaseMapper<Article> {

    @Update("""
            UPDATE blog_article
            SET view_count = view_count + 1
            WHERE slug = #{slug} AND status = 'PUBLISHED'
            """)
    int incrementViewCount(@Param("slug") String slug);
}

