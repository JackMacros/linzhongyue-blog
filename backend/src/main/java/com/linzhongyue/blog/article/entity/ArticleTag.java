package com.linzhongyue.blog.article.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@TableName("blog_article_tag")
public class ArticleTag {
    @TableId(type = IdType.INPUT)
    private Long articleId;
    private Long tagId;
}
