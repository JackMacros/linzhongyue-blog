package com.linzhongyue.blog.common;

import com.baomidou.mybatisplus.core.metadata.IPage;

import java.util.List;

public record PageResponse<T>(List<T> items, long page, long pageSize, long total) {

    public static <T> PageResponse<T> of(IPage<?> source, List<T> items) {
        return new PageResponse<>(items, source.getCurrent(), source.getSize(), source.getTotal());
    }
}

