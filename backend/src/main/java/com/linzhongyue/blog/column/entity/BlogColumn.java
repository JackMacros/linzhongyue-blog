package com.linzhongyue.blog.column.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("blog_column")
public class BlogColumn {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String slug;
    private String nameZh;
    private String nameEn;
    private String descriptionZh;
    private String descriptionEn;
    private String status;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

