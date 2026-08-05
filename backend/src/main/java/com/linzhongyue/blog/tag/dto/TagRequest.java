package com.linzhongyue.blog.tag.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TagRequest(
        @NotBlank(message = "标签名称不能为空") @Size(max = 50, message = "标签名称不能超过 50 个字符") String name,
        @NotBlank(message = "标签颜色不能为空")
        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "标签颜色必须是六位十六进制色值") String color
) {
}

