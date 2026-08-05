package com.linzhongyue.blog.site.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("social_link")
public class SocialLink {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String platform;
    private String handle;
    private String url;
    private String icon;
    private Integer sortOrder;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

