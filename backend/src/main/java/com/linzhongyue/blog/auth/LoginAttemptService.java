package com.linzhongyue.blog.auth;

import com.linzhongyue.blog.common.BusinessException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {
    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(10);
    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();

    public void check(String key) {
        Attempt attempt = attempts.get(key);
        if (attempt == null) {
            return;
        }
        if (Instant.now().isAfter(attempt.startedAt().plus(WINDOW))) {
            attempts.remove(key);
            return;
        }
        if (attempt.failures() >= MAX_FAILURES) {
            throw new BusinessException(42900, org.springframework.http.HttpStatus.TOO_MANY_REQUESTS,
                    "登录失败次数过多，请稍后再试");
        }
    }

    public void failed(String key) {
        attempts.compute(key, (ignored, current) -> {
            if (current == null || Instant.now().isAfter(current.startedAt().plus(WINDOW))) {
                return new Attempt(1, Instant.now());
            }
            return new Attempt(current.failures() + 1, current.startedAt());
        });
    }

    public void succeeded(String key) {
        attempts.remove(key);
    }

    private record Attempt(int failures, Instant startedAt) {
    }
}

