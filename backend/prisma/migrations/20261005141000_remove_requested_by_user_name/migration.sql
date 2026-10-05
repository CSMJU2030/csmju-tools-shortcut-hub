-- AlterTable
ALTER TABLE "link_requests" DROP COLUMN "requested_by_user_name";
ALTER TABLE "link_requests" RENAME COLUMN "requested_by_core_user_id" TO "core_user_id";
ALTER TABLE "link_requests" ADD COLUMN "person_code" TEXT;
