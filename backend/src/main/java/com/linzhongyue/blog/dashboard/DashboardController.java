package com.linzhongyue.blog.dashboard;

import com.linzhongyue.blog.common.ApiResponse;
import com.linzhongyue.blog.dashboard.dto.DashboardView;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {
    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public ApiResponse<DashboardView> summary() {
        return ApiResponse.ok(service.summary());
    }
}
