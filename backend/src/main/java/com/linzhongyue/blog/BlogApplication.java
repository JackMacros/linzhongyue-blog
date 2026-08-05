package com.linzhongyue.blog;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@MapperScan({
        "com.linzhongyue.blog.auth.mapper",
        "com.linzhongyue.blog.article.mapper",
        "com.linzhongyue.blog.column.mapper",
        "com.linzhongyue.blog.tag.mapper",
        "com.linzhongyue.blog.site.mapper",
        "com.linzhongyue.blog.media.mapper",
        "com.linzhongyue.blog.log.mapper",
        "com.linzhongyue.blog.statistics.mapper"
})
@SpringBootApplication
public class BlogApplication {

    public static void main(String[] args) {
        SpringApplication.run(BlogApplication.class, args);
    }
}
