package com.linzhongyue.blog.site.dto;

import com.linzhongyue.blog.site.entity.CareerExperience;
import com.linzhongyue.blog.site.entity.PortfolioProject;
import com.linzhongyue.blog.site.entity.SiteProfile;
import com.linzhongyue.blog.site.entity.SiteSkill;
import com.linzhongyue.blog.site.entity.SocialLink;

import java.util.List;

public record SiteContentView(
        SiteProfile profile,
        List<PortfolioProject> projects,
        List<CareerExperience> experiences,
        List<SiteSkill> skills,
        List<SocialLink> socialLinks
) {
}

