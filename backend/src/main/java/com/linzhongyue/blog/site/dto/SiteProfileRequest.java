package com.linzhongyue.blog.site.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SiteProfileRequest(
        @NotBlank @Size(max = 100) String displayNameZh,
        @NotBlank @Size(max = 100) String displayNameEn,
        @Size(max = 255) String roleZh,
        @Size(max = 255) String roleEn,
        @Size(max = 1000) String heroDescriptionZh,
        @Size(max = 1000) String heroDescriptionEn,
        @NotBlank String aboutParagraph1Zh,
        @NotBlank String aboutParagraph1En,
        @NotBlank String aboutParagraph2Zh,
        @NotBlank String aboutParagraph2En,
        @Size(max = 500) String contactHeadingZh,
        @Size(max = 500) String contactHeadingEn,
        @Size(max = 1000) String contactDescriptionZh,
        @Size(max = 1000) String contactDescriptionEn,
        @Email @Size(max = 100) String email,
        @Size(max = 1000) String avatarUrl,
        @Size(max = 500) String footerZh,
        @Size(max = 500) String footerEn,
        @Size(max = 30) String stat1Value,
        @Size(max = 100) String stat1LabelZh,
        @Size(max = 100) String stat1LabelEn,
        @Size(max = 30) String stat2Value,
        @Size(max = 100) String stat2LabelZh,
        @Size(max = 100) String stat2LabelEn,
        @Size(max = 30) String stat3Value,
        @Size(max = 100) String stat3LabelZh,
        @Size(max = 100) String stat3LabelEn,
        @Size(max = 30) String stat4Value,
        @Size(max = 100) String stat4LabelZh,
        @Size(max = 100) String stat4LabelEn
) {
}

