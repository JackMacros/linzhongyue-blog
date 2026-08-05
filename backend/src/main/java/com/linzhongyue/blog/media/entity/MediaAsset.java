package com.linzhongyue.blog.media.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("media_asset")
public class MediaAsset {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String qiniuKey;
    private String url;
    private String originalName;
    private String mimeType;
    private Long sizeBytes;
    private String contentHash;
    private LocalDateTime createdAt;
}
