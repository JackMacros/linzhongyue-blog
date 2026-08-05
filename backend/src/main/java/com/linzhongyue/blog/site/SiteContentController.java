package com.linzhongyue.blog.site;

import com.linzhongyue.blog.common.ApiResponse;
import com.linzhongyue.blog.log.AdminOperation;
import com.linzhongyue.blog.site.dto.SiteContentView;
import com.linzhongyue.blog.site.dto.SiteProfileRequest;
import com.linzhongyue.blog.site.entity.CareerExperience;
import com.linzhongyue.blog.site.entity.PortfolioProject;
import com.linzhongyue.blog.site.entity.SiteProfile;
import com.linzhongyue.blog.site.entity.SiteSkill;
import com.linzhongyue.blog.site.entity.SocialLink;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SiteContentController {
    private final SiteContentService service;

    public SiteContentController(SiteContentService service) {
        this.service = service;
    }

    @GetMapping("/api/public/site-content")
    public ApiResponse<SiteContentView> publicContent() { return ApiResponse.ok(service.publicContent()); }

    @GetMapping("/api/admin/site-content")
    public ApiResponse<SiteContentView> adminContent() { return ApiResponse.ok(service.adminContent()); }

    @PutMapping("/api/admin/site-content/profile")
    @AdminOperation(module = "站点内容", action = "修改站点资料")
    public ApiResponse<SiteProfile> updateProfile(@Valid @RequestBody SiteProfileRequest request) {
        return ApiResponse.ok(service.updateProfile(request));
    }

    @PostMapping("/api/admin/site-content/projects")
    @AdminOperation(module = "站点内容", action = "新增项目")
    public ApiResponse<PortfolioProject> createProject(@RequestBody PortfolioProject request) { return ApiResponse.ok(service.saveProject(null, request)); }
    @PutMapping("/api/admin/site-content/projects/{id}")
    @AdminOperation(module = "站点内容", action = "编辑项目")
    public ApiResponse<PortfolioProject> updateProject(@PathVariable Long id, @RequestBody PortfolioProject request) { return ApiResponse.ok(service.saveProject(id, request)); }
    @DeleteMapping("/api/admin/site-content/projects/{id}")
    @AdminOperation(module = "站点内容", action = "删除项目")
    public ApiResponse<Void> deleteProject(@PathVariable Long id) { service.deleteProject(id); return ApiResponse.ok(); }

    @PostMapping("/api/admin/site-content/experiences")
    @AdminOperation(module = "站点内容", action = "新增经历")
    public ApiResponse<CareerExperience> createExperience(@RequestBody CareerExperience request) { return ApiResponse.ok(service.saveExperience(null, request)); }
    @PutMapping("/api/admin/site-content/experiences/{id}")
    @AdminOperation(module = "站点内容", action = "编辑经历")
    public ApiResponse<CareerExperience> updateExperience(@PathVariable Long id, @RequestBody CareerExperience request) { return ApiResponse.ok(service.saveExperience(id, request)); }
    @DeleteMapping("/api/admin/site-content/experiences/{id}")
    @AdminOperation(module = "站点内容", action = "删除经历")
    public ApiResponse<Void> deleteExperience(@PathVariable Long id) { service.deleteExperience(id); return ApiResponse.ok(); }

    @PostMapping("/api/admin/site-content/skills")
    @AdminOperation(module = "站点内容", action = "新增技能")
    public ApiResponse<SiteSkill> createSkill(@RequestBody SiteSkill request) { return ApiResponse.ok(service.saveSkill(null, request)); }
    @PutMapping("/api/admin/site-content/skills/{id}")
    @AdminOperation(module = "站点内容", action = "编辑技能")
    public ApiResponse<SiteSkill> updateSkill(@PathVariable Long id, @RequestBody SiteSkill request) { return ApiResponse.ok(service.saveSkill(id, request)); }
    @DeleteMapping("/api/admin/site-content/skills/{id}")
    @AdminOperation(module = "站点内容", action = "删除技能")
    public ApiResponse<Void> deleteSkill(@PathVariable Long id) { service.deleteSkill(id); return ApiResponse.ok(); }

    @PostMapping("/api/admin/site-content/social-links")
    @AdminOperation(module = "站点内容", action = "新增社交链接")
    public ApiResponse<SocialLink> createSocialLink(@RequestBody SocialLink request) { return ApiResponse.ok(service.saveSocialLink(null, request)); }
    @PutMapping("/api/admin/site-content/social-links/{id}")
    @AdminOperation(module = "站点内容", action = "编辑社交链接")
    public ApiResponse<SocialLink> updateSocialLink(@PathVariable Long id, @RequestBody SocialLink request) { return ApiResponse.ok(service.saveSocialLink(id, request)); }
    @DeleteMapping("/api/admin/site-content/social-links/{id}")
    @AdminOperation(module = "站点内容", action = "删除社交链接")
    public ApiResponse<Void> deleteSocialLink(@PathVariable Long id) { service.deleteSocialLink(id); return ApiResponse.ok(); }
}
