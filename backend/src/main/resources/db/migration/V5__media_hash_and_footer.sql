ALTER TABLE media_asset
    ADD COLUMN content_hash CHAR(64) NULL;

CREATE UNIQUE INDEX uk_media_asset_content_hash ON media_asset (content_hash);

UPDATE site_profile
SET footer_zh = 'Copyright©2021-2026 · 苏ICP备2021001257号-1',
    footer_en = 'Copyright©2021-2026 · 苏ICP备2021001257号-1',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;
