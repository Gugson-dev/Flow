/*
  Warnings:

  - You are about to drop the column `content` on the `Task` table. All the data in the column will be lost.
  - Added the required column `date` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "content",
ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TEXT,
ADD COLUMN     "priority" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
