package com.linzhongyue.blog;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class SchemaMigrationTest {

    @Test
    void initialMigrationDefinesExactlyThirteenTables() throws IOException {
        try (var stream = getClass().getResourceAsStream("/db/migration/V1__create_blog_schema.sql")) {
            assertNotNull(stream);
            String sql = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            assertEquals(13, sql.split("CREATE TABLE", -1).length - 1);
        }
    }
}
