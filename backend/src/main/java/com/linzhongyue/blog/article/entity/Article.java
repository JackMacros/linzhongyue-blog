package com.linzhongyue.blog.article.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("blog_article")
public class Article {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String slug;
    private String title;
    private String summary;
    private String coverUrl;
    private String content;
    private Long columnId;
    private String status;
    private LocalDateTime publishedAt;
    private Long viewCount;
    private Integer readMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
