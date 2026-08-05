package com.linzhongyue.blog.column.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ColumnRequest(
        @NotBlank(message = "中文名称不能为空") @Size(max = 100) String nameZh,
        @NotBlank(message = "英文名称不能为空") @Size(max = 100) String nameEn,
        @Size(max = 1000) String descriptionZh,
        @Size(max = 1000) String descriptionEn,
        @NotBlank(message = "专栏状态不能为空")
        @Pattern(regexp = "ONGOING|COMPLETED", message = "专栏状态不正确") String status
) {
}
