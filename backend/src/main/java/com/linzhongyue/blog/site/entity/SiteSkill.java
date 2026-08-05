package com.linzhongyue.blog.site.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("site_skill")
public class SiteSkill {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String groupZh;
    private String groupEn;
    private String name;
    private Integer proficiency;
    private Integer sortOrder;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

