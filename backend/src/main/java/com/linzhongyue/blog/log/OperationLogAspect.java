package com.linzhongyue.blog.log;

import cn.dev33.satoken.stp.StpUtil;
import com.linzhongyue.blog.log.entity.OperationLog;
import com.linzhongyue.blog.log.mapper.OperationLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
public class OperationLogAspect {
    private final OperationLogMapper mapper;

    public OperationLogAspect(OperationLogMapper mapper) {
        this.mapper = mapper;
    }

    @Around("@annotation(operation)")
    public Object record(ProceedingJoinPoint joinPoint, AdminOperation operation) throws Throwable {
        boolean success = false;
        try {
            Object result = joinPoint.proceed();
            success = true;
            return result;
        } finally {
            persist(operation, success);
        }
    }

    private void persist(AdminOperation operation, boolean success) {
        try {
            if (!StpUtil.isLogin()) {
                return;
            }
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            OperationLog entity = new OperationLog();
            entity.setAdminId(StpUtil.getLoginIdAsLong());
            entity.setModule(operation.module());
            entity.setAction(operation.action());
            entity.setHttpMethod(request.getMethod());
            entity.setSuccess(success);
            entity.setCreatedAt(LocalDateTime.now());
            mapper.insert(entity);
        } catch (Exception exception) {
            log.warn("Failed to persist operation log", exception);
        }
    }
}

