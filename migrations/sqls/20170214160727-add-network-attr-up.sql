ALTER TABLE `apps` ADD COLUMN `network` ENUM('bridge','none') NOT NULL DEFAULT 'bridge' AFTER `encryption`;
ALTER TABLE `appVersions` ADD COLUMN `network` ENUM('bridge','none') NOT NULL DEFAULT 'bridge' AFTER `encryption`;