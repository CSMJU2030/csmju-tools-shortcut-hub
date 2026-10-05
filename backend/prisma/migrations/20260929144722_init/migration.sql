-- CreateEnum
CREATE TYPE "LinkCategory" AS ENUM ('ACADEMIC', 'DEV_TOOLS', 'FACULTY_INFO', 'COMMUNITY', 'OTHER');

-- CreateEnum
CREATE TYPE "TargetYear" AS ENUM ('ALL', 'YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "quick_links" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "category" "LinkCategory" NOT NULL DEFAULT 'OTHER',
    "target_years" "TargetYear"[],
    "tags" TEXT[],
    "icon_name" TEXT,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quick_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_requests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "category" "LinkCategory" NOT NULL DEFAULT 'OTHER',
    "target_years" "TargetYear"[],
    "tags" TEXT[],
    "requested_by_core_user_id" TEXT NOT NULL,
    "requested_by_user_name" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "link_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broken_link_reports" (
    "id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "reported_by_core_user_id" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broken_link_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_bookmarks" (
    "id" TEXT NOT NULL,
    "core_user_id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_bookmarks_core_user_id_link_id_key" ON "user_bookmarks"("core_user_id", "link_id");

-- AddForeignKey
ALTER TABLE "broken_link_reports" ADD CONSTRAINT "broken_link_reports_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "quick_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "quick_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
