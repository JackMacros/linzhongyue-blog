package com.linzhongyue.blog.auth;

import com.linzhongyue.blog.common.BusinessException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class LoginAttemptServiceTest {

    @Test
    void blocksAfterFiveFailuresAndClearsAfterSuccess() {
        LoginAttemptService service = new LoginAttemptService();
        String key = "127.0.0.1:admin";
        for (int i = 0; i < 5; i++) {
            service.failed(key);
        }
        BusinessException exception = assertThrows(BusinessException.class, () -> service.check(key));
        assertEquals(42900, exception.getCode());
        service.succeeded(key);
        assertDoesNotThrow(() -> service.check(key));
    }
}

