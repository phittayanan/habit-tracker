-- Issue #168, ADR 0064: template kind. Additive, so the previous app version still runs after it.
CREATE TYPE "TemplateKind" AS ENUM ('COUNT', 'TIME');
ALTER TABLE "Template" ADD COLUMN "kind" "TemplateKind" NOT NULL DEFAULT 'COUNT';
