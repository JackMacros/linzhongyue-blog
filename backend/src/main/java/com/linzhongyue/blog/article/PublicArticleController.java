package com.linzhongyue.blog.article;

import com.linzhongyue.blog.article.dto.ArticleDetail;
import com.linzhongyue.blog.article.dto.ArticleSummary;
import com.linzhongyue.blog.common.ApiResponse;
import com.linzhongyue.blog.common.PageResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/public/articles")
public class PublicArticleController {
    private final ArticleService service;

    public PublicArticleController(ArticleService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<PageResponse<ArticleSummary>> list(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "12") @Min(1) @Max(50) long pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String column) {
        return ApiResponse.ok(service.publicList(page, pageSize, keyword, tag, column));
    }

    @GetMapping("/latest")
    public ApiResponse<List<ArticleSummary>> latest(
            @RequestParam(defaultValue = "3") @Min(1) @Max(20) int limit) {
        return ApiResponse.ok(service.latest(limit));
    }

    @GetMapping("/{slug}")
    public ApiResponse<ArticleDetail> detail(@PathVariable String slug) {
        return ApiResponse.ok(service.publicDetail(slug));
    }

    @PostMapping("/{slug}/view")
    public ApiResponse<Void> view(@PathVariable String slug) {
        service.incrementView(slug);
        return ApiResponse.ok();
    }
}

