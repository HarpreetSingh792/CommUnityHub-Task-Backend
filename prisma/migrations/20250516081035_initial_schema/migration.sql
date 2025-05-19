/*
  Warnings:

  - You are about to alter the column `columnId` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `TaskColumn` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `order` on the `TaskColumn` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `TaskColumn` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `Task` DROP FOREIGN KEY `Task_columnId_fkey`;

-- AlterTable
ALTER TABLE `Task` MODIFY `columnId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `TaskColumn` DROP PRIMARY KEY,
    DROP COLUMN `order`,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_columnId_fkey` FOREIGN KEY (`columnId`) REFERENCES `TaskColumn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
