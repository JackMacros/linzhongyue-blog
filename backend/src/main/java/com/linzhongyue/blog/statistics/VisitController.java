package com.linzhongyue.blog.statistics;

import com.linzhongyue.blog.common.ApiResponse;
import com.linzhongyue.blog.statistics.dto.VisitRequest;
import com.linzhongyue.blog.statistics.mapper.DailyVisitStatMapper;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/public/visits")
public class VisitController {
    private final DailyVisitStatMapper mapper;

    public VisitController(DailyVisitStatMapper mapper) {
        this.mapper = mapper;
    }

    @PostMapping
    public ApiResponse<Void> record(@RequestBody(required = false) VisitRequest request) {
        mapper.recordVisit(LocalDate.now(), request != null && request.newVisitor() ? 1 : 0);
        return ApiResponse.ok();
    }
}

