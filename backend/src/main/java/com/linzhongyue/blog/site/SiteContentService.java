package com.linzhongyue.blog.site;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.linzhongyue.blog.common.BusinessException;
import com.linzhongyue.blog.site.dto.SiteContentView;
import com.linzhongyue.blog.site.dto.SiteProfileRequest;
import com.linzhongyue.blog.site.entity.CareerExperience;
import com.linzhongyue.blog.site.entity.PortfolioProject;
import com.linzhongyue.blog.site.entity.SiteProfile;
import com.linzhongyue.blog.site.entity.SiteSkill;
import com.linzhongyue.blog.site.entity.SocialLink;
import com.linzhongyue.blog.site.mapper.CareerExperienceMapper;
import com.linzhongyue.blog.site.mapper.PortfolioProjectMapper;
import com.linzhongyue.blog.site.mapper.SiteProfileMapper;
import com.linzhongyue.blog.site.mapper.SiteSkillMapper;
import com.linzhongyue.blog.site.mapper.SocialLinkMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SiteContentService {
    private final SiteProfileMapper profileMapper;
    private final PortfolioProjectMapper projectMapper;
    private final CareerExperienceMapper experienceMapper;
    private final SiteSkillMapper skillMapper;
    private final SocialLinkMapper socialLinkMapper;

    public SiteContentService(SiteProfileMapper profileMapper, PortfolioProjectMapper projectMapper,
                              CareerExperienceMapper experienceMapper, SiteSkillMapper skillMapper,
                              SocialLinkMapper socialLinkMapper) {
        this.profileMapper = profileMapper;
        this.projectMapper = projectMapper;
        this.experienceMapper = experienceMapper;
        this.skillMapper = skillMapper;
        this.socialLinkMapper = socialLinkMapper;
    }

    @Cacheable(value = "siteContent", key = "'public'")
    public SiteContentView publicContent() {
        return aggregate(true);
    }

    public SiteContentView adminContent() {
        return aggregate(false);
    }

    @Transactional
    @CacheEvict(value = "siteContent", allEntries = true)
    public SiteProfile updateProfile(SiteProfileRequest request) {
        SiteProfile profile = profileMapper.selectById(1L);
        if (profile == null) {
            profile = new SiteProfile();
            profile.setId(1L);
        }
        profile.setDisplayNameZh(request.displayNameZh().trim());
        profile.setDisplayNameEn(request.displayNameEn().trim());
        profile.setRoleZh(clean(request.roleZh()));
        profile.setRoleEn(clean(request.roleEn()));
        profile.setHeroDescriptionZh(clean(request.heroDescriptionZh()));
        profile.setHeroDescriptionEn(clean(request.heroDescriptionEn()));
        profile.setAboutParagraph1Zh(request.aboutParagraph1Zh());
        profile.setAboutParagraph1En(request.aboutParagraph1En());
        profile.setAboutParagraph2Zh(request.aboutParagraph2Zh());
        profile.setAboutParagraph2En(request.aboutParagraph2En());
        profile.setContactHeadingZh(clean(request.contactHeadingZh()));
        profile.setContactHeadingEn(clean(request.contactHeadingEn()));
        profile.setContactDescriptionZh(clean(request.contactDescriptionZh()));
        profile.setContactDescriptionEn(clean(request.contactDescriptionEn()));
        profile.setEmail(clean(request.email()));
        // The single administrator avatar is the public profile avatar source of truth.
        profile.setFooterZh(clean(request.footerZh()));
        profile.setFooterEn(clean(request.footerEn()));
        profile.setStat1Value(clean(request.stat1Value()));
        profile.setStat1LabelZh(clean(request.stat1LabelZh()));
        profile.setStat1LabelEn(clean(request.stat1LabelEn()));
        profile.setStat2Value(clean(request.stat2Value()));
        profile.setStat2LabelZh(clean(request.stat2LabelZh()));
        profile.setStat2LabelEn(clean(request.stat2LabelEn()));
        profile.setStat3Value(clean(request.stat3Value()));
        profile.setStat3LabelZh(clean(request.stat3LabelZh()));
        profile.setStat3LabelEn(clean(request.stat3LabelEn()));
        profile.setStat4Value(clean(request.stat4Value()));
        profile.setStat4LabelZh(clean(request.stat4LabelZh()));
        profile.setStat4LabelEn(clean(request.stat4LabelEn()));
        profile.setUpdatedAt(LocalDateTime.now());
        if (profileMapper.selectById(1L) == null) {
            profileMapper.insert(profile);
        } else {
            profileMapper.updateById(profile);
        }
        return profile;
    }

    @Transactional
    @CacheEvict(value = "siteContent", allEntries = true)
    public PortfolioProject saveProject(Long id, PortfolioProject input) {
        PortfolioProject entity = id == null ? new PortfolioProject() : requireProject(id);
        entity.setName(required(input.getName(), "项目名称不能为空"));
        entity.setSubtitleZh(clean(input.getSubtitleZh()));
        entity.setSubtitleEn(clean(input.getSubtitleEn()));
        entity.setDescriptionZh(clean(input.getDescriptionZh()));
        entity.setDescriptionEn(clean(input.getDescriptionEn()));
        entity.setTechStack(clean(input.getTechStack()));
        entity.setProjectUrl(nullable(input.getProjectUrl()));
        entity.setImageUrl(nullable(input.getImageUrl()));
        entity.setSortOrder(input.getSortOrder() == null ? 0 : input.getSortOrder());
        entity.setEnabled(input.getEnabled() == null || input.getEnabled());
        entity.setUpdatedAt(LocalDateTime.now());
        if (id == null) {
            entity.setCreatedAt(LocalDateTime.now());
            projectMapper.insert(entity);
        } else {
            projectMapper.updateById(entity);
        }
        return entity;
    }

    @Transactional
    @CacheEvict(value = "siteContent", allEntries = true)
    public CareerExperience saveExperience(Long id, CareerExperience input) {
        CareerExperience entity = id == null ? new CareerExperience() : requireExperience(id);
        entity.setPeriodZh(required(input.getPeriodZh(), "中文时间范围不能为空"));
        entity.setPeriodEn(required(input.getPeriodEn(), "英文时间范围不能为空"));
        entity.setRoleZh(required(input.getRoleZh(), "中文职位不能为空"));
        entity.setRoleEn(required(input.getRoleEn(), "英文职位不能为空"));
        entity.setOrganizationZh(clean(input.getOrganizationZh()));
        entity.setOrganizationEn(clean(input.getOrganizationEn()));
        entity.setDescriptionZh(clean(input.getDescriptionZh()));
        entity.setDescriptionEn(clean(input.getDescriptionEn()));
        entity.setSortOrder(input.getSortOrder() == null ? 0 : input.getSortOrder());
        entity.setEnabled(input.getEnabled() == null || input.getEnabled());
        entity.setUpdatedAt(LocalDateTime.now());
        if (id == null) {
            entity.setCreatedAt(LocalDateTime.now());
            experienceMapper.insert(entity);
        } else {
            experienceMapper.updateById(entity);
        }
        return entity;
    }

    @Transactional
    @CacheEvict(value = "siteContent", allEntries = true)
    public SiteSkill saveSkill(Long id, SiteSkill input) {
        SiteSkill entity = id == null ? new SiteSkill() : requireSkill(id);
        entity.setGroupZh(required(input.getGroupZh(), "中文技能分组不能为空"));
        entity.setGroupEn(required(input.getGroupEn(), "英文技能分组不能为空"));
        entity.setName(required(input.getName(), "技能名称不能为空"));
        entity.setProficiency(input.getProficiency());
        entity.setSortOrder(input.getSortOrder() == null ? 0 : input.getSortOrder());
        entity.setEnabled(input.getEnabled() == null || input.getEnabled());
        entity.setUpdatedAt(LocalDateTime.now());
        if (id == null) {
            entity.setCreatedAt(LocalDateTime.now());
            skillMapper.insert(entity);
        } else {
            skillMapper.updateById(entity);
        }
        return entity;
    }

    @Transactional
    @CacheEvict(value = "siteContent", allEntries = true)
    public SocialLink saveSocialLink(Long id, SocialLink input) {
        SocialLink entity = id == null ? new SocialLink() : requireSocialLink(id);
        entity.setPlatform(required(input.getPlatform(), "平台名称不能为空"));
        entity.setHandle(clean(input.getHandle()));
        entity.setUrl(required(input.getUrl(), "链接地址不能为空"));
        entity.setIcon(nullable(input.getIcon()));
        entity.setSortOrder(input.getSortOrder() == null ? 0 : input.getSortOrder());
        entity.setEnabled(input.getEnabled() == null || input.getEnabled());
        entity.setUpdatedAt(LocalDateTime.now());
        if (id == null) {
            entity.setCreatedAt(LocalDateTime.now());
            socialLinkMapper.insert(entity);
        } else {
            socialLinkMapper.updateById(entity);
        }
        return entity;
    }

    @Transactional
    @CacheEvict(value = "siteContent", allEntries = true)
    public void deleteProject(Long id) { projectMapper.deleteById(requireProject(id).getId()); }

    @Transactional
    @CacheEvict(value = "siteContent", allEntries = true)
    public void deleteExperience(Long id) { experienceMapper.deleteById(requireExperience(id).getId()); }

    @Transactional
    @CacheEvict(value = "siteContent", allEntries = true)
    public void deleteSkill(Long id) { skillMapper.deleteById(requireSkill(id).getId()); }

    @Transactional
    @CacheEvict(value = "siteContent", allEntries = true)
    public void deleteSocialLink(Long id) { socialLinkMapper.deleteById(requireSocialLink(id).getId()); }

    private SiteContentView aggregate(boolean publicOnly) {
        LambdaQueryWrapper<PortfolioProject> projects = new LambdaQueryWrapper<PortfolioProject>()
                .eq(publicOnly, PortfolioProject::getEnabled, true)
                .orderByDesc(PortfolioProject::getSortOrder).orderByAsc(PortfolioProject::getId);
        LambdaQueryWrapper<CareerExperience> experiences = new LambdaQueryWrapper<CareerExperience>()
                .eq(publicOnly, CareerExperience::getEnabled, true)
                .orderByDesc(CareerExperience::getSortOrder).orderByAsc(CareerExperience::getId);
        LambdaQueryWrapper<SiteSkill> skills = new LambdaQueryWrapper<SiteSkill>()
                .eq(publicOnly, SiteSkill::getEnabled, true)
                .orderByDesc(SiteSkill::getSortOrder).orderByAsc(SiteSkill::getId);
        LambdaQueryWrapper<SocialLink> links = new LambdaQueryWrapper<SocialLink>()
                .eq(publicOnly, SocialLink::getEnabled, true)
                .orderByDesc(SocialLink::getSortOrder).orderByAsc(SocialLink::getId);
        return new SiteContentView(profileMapper.selectById(1L), projectMapper.selectList(projects),
                experienceMapper.selectList(experiences), skillMapper.selectList(skills), socialLinkMapper.selectList(links));
    }

    private PortfolioProject requireProject(Long id) {
        PortfolioProject entity = projectMapper.selectById(id);
        if (entity == null) throw BusinessException.notFound("项目不存在");
        return entity;
    }
    private CareerExperience requireExperience(Long id) {
        CareerExperience entity = experienceMapper.selectById(id);
        if (entity == null) throw BusinessException.notFound("经历不存在");
        return entity;
    }
    private SiteSkill requireSkill(Long id) {
        SiteSkill entity = skillMapper.selectById(id);
        if (entity == null) throw BusinessException.notFound("技能不存在");
        return entity;
    }
    private SocialLink requireSocialLink(Long id) {
        SocialLink entity = socialLinkMapper.selectById(id);
        if (entity == null) throw BusinessException.notFound("社交链接不存在");
        return entity;
    }
    private String clean(String value) { return value == null ? "" : value.trim(); }
    private String nullable(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private String required(String value, String message) {
        if (value == null || value.isBlank()) throw BusinessException.badRequest(message);
        return value.trim();
    }
}
