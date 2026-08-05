package com.linzhongyue.blog.column;

import com.linzhongyue.blog.column.dto.ColumnRequest;
import com.linzhongyue.blog.column.dto.ColumnReorderRequest;
import com.linzhongyue.blog.column.dto.ColumnView;
import com.linzhongyue.blog.common.ApiResponse;
import com.linzhongyue.blog.log.AdminOperation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ColumnController {
    private final ColumnService service;

    public ColumnController(ColumnService service) {
        this.service = service;
    }

    @GetMapping("/api/public/columns")
    public ApiResponse<List<ColumnView>> publicList() {
        return ApiResponse.ok(service.publicList());
    }

    @GetMapping("/api/public/columns/{slug}")
    public ApiResponse<ColumnView> publicDetail(@PathVariable String slug) {
        return ApiResponse.ok(service.publicDetail(slug));
    }

    @GetMapping("/api/admin/columns")
    public ApiResponse<List<ColumnView>> adminList() {
        return ApiResponse.ok(service.adminList());
    }

    @PostMapping("/api/admin/columns")
    @AdminOperation(module = "专栏", action = "新增专栏")
    public ApiResponse<ColumnView> create(@Valid @RequestBody ColumnRequest request) {
        return ApiResponse.ok(service.create(request));
    }

    @PutMapping("/api/admin/columns/{id}")
    @AdminOperation(module = "专栏", action = "编辑专栏")
    public ApiResponse<ColumnView> update(@PathVariable Long id, @Valid @RequestBody ColumnRequest request) {
        return ApiResponse.ok(service.update(id, request));
    }

    @PutMapping("/api/admin/columns/reorder")
    @AdminOperation(module = "专栏", action = "调整专栏顺序")
    public ApiResponse<Void> reorder(@Valid @RequestBody ColumnReorderRequest request) {
        service.reorder(request.ids());
        return ApiResponse.ok();
    }

    @DeleteMapping("/api/admin/columns/{id}")
    @AdminOperation(module = "专栏", action = "删除专栏")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.ok();
    }
}
