package com.linzhongyue.blog.site.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("site_profile")
public class SiteProfile {
    @TableId(type = IdType.INPUT)
    private Long id;
    private String displayNameZh;
    private String displayNameEn;
    private String roleZh;
    private String roleEn;
    private String heroDescriptionZh;
    private String heroDescriptionEn;
    private String aboutParagraph1Zh;
    private String aboutParagraph1En;
    private String aboutParagraph2Zh;
    private String aboutParagraph2En;
    private String contactHeadingZh;
    private String contactHeadingEn;
    private String contactDescriptionZh;
    private String contactDescriptionEn;
    private String email;
    private String avatarUrl;
    private String footerZh;
    private String footerEn;
    private String stat1Value;
    private String stat1LabelZh;
    private String stat1LabelEn;
    private String stat2Value;
    private String stat2LabelZh;
    private String stat2LabelEn;
    private String stat3Value;
    private String stat3LabelZh;
    private String stat3LabelEn;
    private String stat4Value;
    private String stat4LabelZh;
    private String stat4LabelEn;
    private LocalDateTime updatedAt;
}
