-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "isCancelling" TEXT,
ADD COLUMN     "subscriptionExpires" TIMESTAMP(3),
ADD COLUMN     "subscriptionId" TEXT;
