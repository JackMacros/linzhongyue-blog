package com.linzhongyue.blog.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linzhongyue.blog.column.dto.ColumnView;
import com.linzhongyue.blog.common.PageResponse;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.serializer.RedisSerializer;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class CacheConfigTest {

    @Test
    void shouldPreserveFinalRecordTypeWhenReadingCachedValue() {
        ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
        RedisSerializer<Object> serializer = CacheConfig.cacheSerializer(objectMapper);
        PageResponse<String> original = new PageResponse<>(new ArrayList<>(List.of("article")), 1, 10, 1);

        Object restored = serializer.deserialize(serializer.serialize(original));

        assertThat(restored).isInstanceOf(PageResponse.class);
        assertThat((PageResponse<?>) restored).isEqualTo(original);
    }

    @Test
    void shouldPreserveStreamListTypeWhenReadingCachedValue() {
        ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
        RedisSerializer<Object> serializer = CacheConfig.cacheSerializer(objectMapper);
        List<ColumnView> original = Stream.of(new ColumnView(
                1L, "java", "Java", "Java", "", "", "PUBLISHED", 10, 1, null, null
        )).toList();

        Object restored = serializer.deserialize(serializer.serialize(original));

        assertThat(restored).isInstanceOf(List.class);
        assertThat(restored).isEqualTo(original);
    }
}
