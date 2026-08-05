package com.linzhongyue.blog.article;

import com.linzhongyue.blog.article.dto.ArticleRequest;
import com.linzhongyue.blog.article.mapper.ArticleMapper;
import com.linzhongyue.blog.article.mapper.ArticleTagMapper;
import com.linzhongyue.blog.column.mapper.BlogColumnMapper;
import com.linzhongyue.blog.common.BusinessException;
import com.linzhongyue.blog.tag.mapper.TagMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {
    @Mock ArticleMapper articleMapper;
    @Mock ArticleTagMapper articleTagMapper;
    @Mock TagMapper tagMapper;
    @Mock BlogColumnMapper columnMapper;

    @Test
    void rejectsDisallowedRawHtml() {
        ArticleService service = new ArticleService(articleMapper, articleTagMapper, tagMapper, columnMapper);
        ArticleRequest request = new ArticleRequest("标题", "摘要", "",
                "## Heading\n<div class=\"custom\">unsafe</div>", null, List.of(), "DRAFT", null);
        BusinessException exception = assertThrows(BusinessException.class, () -> service.create(request));
        assertEquals(40000, exception.getCode());
    }
}
