package com.linzhongyue.blog.site.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("career_experience")
public class CareerExperience {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String periodZh;
    private String periodEn;
    private String roleZh;
    private String roleEn;
    private String organizationZh;
    private String organizationEn;
    private String descriptionZh;
    private String descriptionEn;
    private Integer sortOrder;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

