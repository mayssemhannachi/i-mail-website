-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "emailAdress" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_emailAdress_key" ON "User"("emailAdress");
