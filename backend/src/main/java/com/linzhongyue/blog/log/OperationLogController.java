package com.linzhongyue.blog.log;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.linzhongyue.blog.common.ApiResponse;
import com.linzhongyue.blog.common.PageResponse;
import com.linzhongyue.blog.log.entity.OperationLog;
import com.linzhongyue.blog.log.mapper.OperationLogMapper;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/admin/operation-logs")
public class OperationLogController {
    private final OperationLogMapper mapper;

    public OperationLogController(OperationLogMapper mapper) {
        this.mapper = mapper;
    }

    @GetMapping
    public ApiResponse<PageResponse<OperationLog>> list(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long pageSize) {
        Page<OperationLog> result = mapper.selectPage(new Page<>(page, pageSize),
                new LambdaQueryWrapper<OperationLog>().orderByDesc(OperationLog::getCreatedAt));
        return ApiResponse.ok(PageResponse.of(result, result.getRecords()));
    }

    @DeleteMapping
    @AdminOperation(module = "日志", action = "清空操作日志")
    public ApiResponse<Void> clear() {
        mapper.delete(null);
        return ApiResponse.ok();
    }
}
