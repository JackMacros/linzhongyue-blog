package com.linzhongyue.blog.column.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ColumnReorderRequest(
        @NotEmpty(message = "专栏顺序不能为空")
        @Size(max = 200, message = "专栏数量过多") List<Long> ids
) {
}
