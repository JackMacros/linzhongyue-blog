package com.linzhongyue.blog.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Configuration
public class CacheConfig implements CachingConfigurer {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory, ObjectMapper objectMapper) {
        RedisSerializer<Object> serializer = cacheSerializer(objectMapper);
        RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
                .disableCachingNullValues()
                .computePrefixWith(name -> "blog:v3:" + name + "::")
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer));

        Map<String, RedisCacheConfiguration> configurations = Map.of(
                "articleDetail", base.entryTtl(Duration.ofMinutes(30)),
                "articleList", base.entryTtl(Duration.ofMinutes(5)),
                "latestArticles", base.entryTtl(Duration.ofMinutes(5)),
                "tags", base.entryTtl(Duration.ofMinutes(30)),
                "columns", base.entryTtl(Duration.ofMinutes(15)),
                "siteContent", base.entryTtl(Duration.ofMinutes(30)),
                "dashboard", base.entryTtl(Duration.ofMinutes(1))
        );
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(base.entryTtl(Duration.ofMinutes(10)))
                .withInitialCacheConfigurations(configurations)
                .build();
    }

    static RedisSerializer<Object> cacheSerializer(ObjectMapper objectMapper) {
        GenericJackson2JsonRedisSerializer delegate = GenericJackson2JsonRedisSerializer.builder()
                .objectMapper(objectMapper.copy())
                .defaultTyping(true)
                .build();
        return new RedisSerializer<>() {
            @Override
            public byte[] serialize(Object value) {
                Object serializableValue = value instanceof List<?> list ? new ArrayList<>(list) : value;
                return delegate.serialize(serializableValue);
            }

            @Override
            public Object deserialize(byte[] bytes) {
                return delegate.deserialize(bytes);
            }
        };
    }

    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis cache read failed, falling back to database: cache={}, key={}, error={}: {}",
                        cache.getName(), key, exception.getClass().getSimpleName(), exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Redis cache write failed: cache={}, key={}, error={}: {}",
                        cache.getName(), key, exception.getClass().getSimpleName(), exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis cache eviction failed: cache={}, key={}, error={}: {}",
                        cache.getName(), key, exception.getClass().getSimpleName(), exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Redis cache clear failed: cache={}, error={}: {}",
                        cache.getName(), exception.getClass().getSimpleName(), exception.getMessage());
            }
        };
    }
}
