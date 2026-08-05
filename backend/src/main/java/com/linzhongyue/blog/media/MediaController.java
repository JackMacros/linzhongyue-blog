package com.linzhongyue.blog.media;

import com.linzhongyue.blog.common.ApiResponse;
import com.linzhongyue.blog.common.PageResponse;
import com.linzhongyue.blog.log.AdminOperation;
import com.linzhongyue.blog.media.entity.MediaAsset;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Validated
@RestController
@RequestMapping("/api/admin/media")
public class MediaController {
    private final MediaService service;

    public MediaController(MediaService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<PageResponse<MediaAsset>> list(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "24") @Min(1) @Max(100) long pageSize,
            @RequestParam(required = false) String keyword) {
        return ApiResponse.ok(service.list(page, pageSize, keyword));
    }

    @PostMapping("/images")
    @AdminOperation(module = "素材", action = "上传图片")
    public ApiResponse<MediaAsset> upload(@RequestPart("file") MultipartFile file) {
        return ApiResponse.ok(service.upload(file));
    }

    @DeleteMapping("/{id}")
    @AdminOperation(module = "素材", action = "删除图片")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.ok();
    }
}
