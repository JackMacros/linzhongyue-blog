package com.linzhongyue.blog.tag;

import com.linzhongyue.blog.common.ApiResponse;
import com.linzhongyue.blog.log.AdminOperation;
import com.linzhongyue.blog.tag.dto.TagRequest;
import com.linzhongyue.blog.tag.dto.TagView;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TagController {
    private final TagService service;

    public TagController(TagService service) {
        this.service = service;
    }

    @GetMapping("/api/public/tags")
    public ApiResponse<List<TagView>> publicList() {
        return ApiResponse.ok(service.publicList());
    }

    @GetMapping("/api/admin/tags")
    public ApiResponse<List<TagView>> adminList() {
        return ApiResponse.ok(service.adminList());
    }

    @PostMapping("/api/admin/tags")
    @AdminOperation(module = "标签", action = "新增标签")
    public ApiResponse<TagView> create(@Valid @RequestBody TagRequest request) {
        return ApiResponse.ok(service.create(request));
    }

    @PutMapping("/api/admin/tags/{id}")
    @AdminOperation(module = "标签", action = "编辑标签")
    public ApiResponse<TagView> update(@PathVariable Long id, @Valid @RequestBody TagRequest request) {
        return ApiResponse.ok(service.update(id, request));
    }

    @DeleteMapping("/api/admin/tags/{id}")
    @AdminOperation(module = "标签", action = "删除标签")
    public ApiResponse<Void> delete(@PathVariable Long id,
                                    @RequestParam(defaultValue = "false") boolean force) {
        service.delete(id, force);
        return ApiResponse.ok();
    }
}
