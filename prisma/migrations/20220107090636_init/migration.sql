-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "age" INTEGER,
    "time" INTEGER,
    "created" BOOLEAN
);

-- CreateTable
CREATE TABLE "Todo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "tag1" TEXT,
    "tag2" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "prio" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PeopleId" (
    "customid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "age" INTEGER,
    "time" INTEGER,
    "created" BOOLEAN
);

-- CreateTable
CREATE TABLE "People" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "time" INTEGER,
    "created" BOOLEAN
);
