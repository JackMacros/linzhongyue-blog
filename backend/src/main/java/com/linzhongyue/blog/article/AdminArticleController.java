package com.linzhongyue.blog.article;

import com.linzhongyue.blog.article.dto.ArticleDetail;
import com.linzhongyue.blog.article.dto.ArticleRequest;
import com.linzhongyue.blog.article.dto.ArticleStatusRequest;
import com.linzhongyue.blog.article.dto.ArticleSummary;
import com.linzhongyue.blog.common.ApiResponse;
import com.linzhongyue.blog.common.PageResponse;
import com.linzhongyue.blog.log.AdminOperation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/admin/articles")
public class AdminArticleController {
    private final ArticleService service;

    public AdminArticleController(ArticleService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<PageResponse<ArticleSummary>> list(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long columnId,
            @RequestParam(required = false) Long tagId) {
        return ApiResponse.ok(service.adminList(page, pageSize, keyword, status, columnId, tagId));
    }

    @GetMapping("/{id}")
    public ApiResponse<ArticleDetail> detail(@PathVariable Long id) {
        return ApiResponse.ok(service.adminDetail(id));
    }

    @PostMapping
    @AdminOperation(module = "文章", action = "新增文章")
    public ApiResponse<ArticleDetail> create(@Valid @RequestBody ArticleRequest request) {
        return ApiResponse.ok(service.create(request));
    }

    @PutMapping("/{id}")
    @AdminOperation(module = "文章", action = "编辑文章")
    public ApiResponse<ArticleDetail> update(@PathVariable Long id, @Valid @RequestBody ArticleRequest request) {
        return ApiResponse.ok(service.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @AdminOperation(module = "文章", action = "修改发布状态")
    public ApiResponse<ArticleDetail> changeStatus(@PathVariable Long id,
                                                    @Valid @RequestBody ArticleStatusRequest request) {
        return ApiResponse.ok(service.changeStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @AdminOperation(module = "文章", action = "删除文章")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.ok();
    }
}
