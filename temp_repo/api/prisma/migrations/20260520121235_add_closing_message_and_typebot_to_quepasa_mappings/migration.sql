ALTER TABLE "quepasa_mappings" ADD COLUMN "closing_message" TEXT;
ALTER TABLE "quepasa_mappings" ADD COLUMN "return_webhook_url" TEXT;
ALTER TABLE "quepasa_mappings" ADD COLUMN "use_typebot" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "quepasa_mappings" ADD COLUMN "typebot_flow_id" TEXT;
ALTER TABLE "quepasa_mappings" ADD COLUMN "typebot_host" TEXT;
ALTER TABLE "quepasa_mappings" ADD COLUMN "typebot_api_key" TEXT;
