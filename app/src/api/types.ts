export interface ApiResponse<T> { code: number; message: string; data: T }
export interface PageResponse<T> { items: T[]; page: number; pageSize: number; total: number }
export interface AdminUser { id: number; username: string; nickname: string; email?: string; avatarUrl?: string; lastLoginAt?: string; createdAt: string }
export interface TagView { id: number; name: string; color: string; articleCount: number }
export interface ArticleColumn { id: number; slug: string; nameZh: string; nameEn: string }
export interface ArticleSummary { id: number; slug: string; title: string; summary: string; coverUrl:string; status: 'DRAFT'|'PUBLISHED'; column: ArticleColumn|null; tags: TagView[]; publishedAt:string|null; viewCount:number; readMinutes:number; createdAt:string; updatedAt:string }
export interface ArticleDetail extends ArticleSummary { content:string; related:ArticleSummary[] }
export interface ColumnView { id:number; slug:string; nameZh:string; nameEn:string; descriptionZh:string; descriptionEn:string; status:'ONGOING'|'COMPLETED'; sortOrder:number; articleCount:number; latestPublishedAt?:string; updatedAt:string }
export interface DashboardView { articleCount:number; publishedCount:number; draftCount:number; tagCount:number; columnCount:number; totalViews:number; visitTrend:{date:string;pv:number;uv:number}[]; topArticles:{id:number;title:string;slug:string;views:number}[]; latestDrafts:{id:number;title:string;updatedAt:string}[] }
export interface MediaAsset { id:number; qiniuKey:string; url:string; originalName:string; mimeType:string; sizeBytes:number; createdAt:string }
export interface OperationLog { id:number; adminId:number; module:string; action:string; httpMethod:string; success:boolean; createdAt:string }
export interface SiteProfile { [key:string]: string|number|undefined; id:number; displayNameZh:string; displayNameEn:string; roleZh:string; roleEn:string; heroDescriptionZh:string; heroDescriptionEn:string; aboutParagraph1Zh:string; aboutParagraph1En:string; aboutParagraph2Zh:string; aboutParagraph2En:string; contactHeadingZh:string; contactHeadingEn:string; contactDescriptionZh:string; contactDescriptionEn:string; email:string; avatarUrl?:string; footerZh:string; footerEn:string; stat1Value:string; stat1LabelZh:string; stat1LabelEn:string; stat2Value:string; stat2LabelZh:string; stat2LabelEn:string; stat3Value:string; stat3LabelZh:string; stat3LabelEn:string; stat4Value:string; stat4LabelZh:string; stat4LabelEn:string }
export interface PortfolioProject { id:number; name:string; subtitleZh:string; subtitleEn:string; descriptionZh:string; descriptionEn:string; techStack:string; projectUrl?:string; imageUrl?:string; sortOrder:number; enabled:boolean }
export interface CareerExperience { id:number; periodZh:string; periodEn:string; roleZh:string; roleEn:string; organizationZh:string; organizationEn:string; descriptionZh:string; descriptionEn:string; sortOrder:number; enabled:boolean }
export interface SiteSkill { id:number; groupZh:string; groupEn:string; name:string; proficiency?:number; sortOrder:number; enabled:boolean }
export interface SocialLink { id:number; platform:string; handle:string; url:string; icon?:string; sortOrder:number; enabled:boolean }
export interface SiteContent { profile:SiteProfile; projects:PortfolioProject[]; experiences:CareerExperience[]; skills:SiteSkill[]; socialLinks:SocialLink[] }
