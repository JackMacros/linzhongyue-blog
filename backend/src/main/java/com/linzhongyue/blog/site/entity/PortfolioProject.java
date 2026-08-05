package com.linzhongyue.blog.site.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("portfolio_project")
public class PortfolioProject {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String subtitleZh;
    private String subtitleEn;
    private String descriptionZh;
    private String descriptionEn;
    private String techStack;
    private String projectUrl;
    private String imageUrl;
    private Integer sortOrder;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

