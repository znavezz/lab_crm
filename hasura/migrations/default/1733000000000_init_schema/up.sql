-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "MemberRank" AS ENUM ('PROFESSOR', 'PhD', 'POSTDOC', 'MSc', 'BSc', 'Mr', 'Mrs');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'ALUMNI', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('PI', 'STUDENT', 'LAB_MANAGER', 'RESEARCHER', 'ADVISOR', 'INTERN', 'CONTRACTOR', 'GUEST', 'ALUMNI', 'OTHER');

-- CreateEnum
CREATE TYPE "ProtocolCategory" AS ENUM ('WET_LAB', 'COMPUTATIONAL', 'SAFETY', 'GENERAL');

-- CreateEnum
CREATE TYPE "ProtocolDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "AcademicInfo" (
    "id" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT,
    "institution" TEXT,
    "graduationYear" INTEGER,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "expiresAt" INTEGER,
    "tokenType" TEXT,
    "scope" TEXT,
    "idToken" TEXT,
    "sessionState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT,
    "equipmentId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "projectId" TEXT,
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaborator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "projectId" TEXT,
    "memberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serialNumber" TEXT,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "projectId" TEXT,
    "memberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT,
    "grantId" TEXT,
    "eventId" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Grant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteTask" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memberId" TEXT,
    "projectId" TEXT,
    "grantId" TEXT,
    "eventId" TEXT,
    "publicationId" TEXT,
    "documentId" TEXT,
    "equipmentId" TEXT,
    "collaboratorId" TEXT,
    "expenseId" TEXT,
    "protocolId" TEXT,

    CONSTRAINT "NoteTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rank" "MemberRank",
    "status" "MemberStatus",
    "role" "MemberRole",
    "scholarship" INTEGER,
    "photoUrl" TEXT,
    "joinedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Protocol" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "ProtocolCategory" NOT NULL DEFAULT 'GENERAL',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "estimatedTime" TEXT,
    "difficulty" "ProtocolDifficulty" NOT NULL DEFAULT 'INTERMEDIATE',
    "tags" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT,
    "projectId" TEXT,
    "documentId" TEXT,
    "materials" TEXT,
    "equipment" TEXT,
    "steps" TEXT,
    "safetyNotes" TEXT,
    "versionHistory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Protocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "published" TIMESTAMP(3),
    "doi" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "phoneVerified" TIMESTAMP(3),
    "memberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateTable
CREATE TABLE "SmsVerificationCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsVerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebAuthnChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebAuthnChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable (M:N Junction Tables)
CREATE TABLE "_CollaboratorToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollaboratorToProject_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE TABLE "_EquipmentToEvent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EquipmentToEvent_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE TABLE "_EventToMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToMember_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE TABLE "_EventToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToProject_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE TABLE "_GrantToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GrantToProject_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE TABLE "_ProjectMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectMembers_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE TABLE "_MemberToPublication" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MemberToPublication_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE TABLE "_ProjectToPublication" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectToPublication_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "AcademicInfo_memberId_idx" ON "AcademicInfo"("memberId");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE INDEX "Booking_equipmentId_idx" ON "Booking"("equipmentId");
CREATE INDEX "Booking_memberId_idx" ON "Booking"("memberId");
CREATE INDEX "Booking_projectId_idx" ON "Booking"("projectId");
CREATE INDEX "Booking_eventId_idx" ON "Booking"("eventId");
CREATE INDEX "Booking_equipmentId_startTime_endTime_idx" ON "Booking"("equipmentId", "startTime", "endTime");
CREATE INDEX "Collaborator_name_idx" ON "Collaborator"("name");
CREATE INDEX "Document_projectId_idx" ON "Document"("projectId");
CREATE INDEX "Document_memberId_idx" ON "Document"("memberId");
CREATE UNIQUE INDEX "Equipment_serialNumber_key" ON "Equipment"("serialNumber");
CREATE INDEX "Equipment_projectId_idx" ON "Equipment"("projectId");
CREATE INDEX "Equipment_memberId_idx" ON "Equipment"("memberId");
CREATE INDEX "Equipment_name_idx" ON "Equipment"("name");
CREATE INDEX "Event_title_idx" ON "Event"("title");
CREATE INDEX "Event_date_idx" ON "Event"("date");
CREATE INDEX "Expense_projectId_idx" ON "Expense"("projectId");
CREATE INDEX "Expense_grantId_idx" ON "Expense"("grantId");
CREATE INDEX "Expense_eventId_idx" ON "Expense"("eventId");
CREATE INDEX "Grant_name_idx" ON "Grant"("name");
CREATE INDEX "NoteTask_memberId_idx" ON "NoteTask"("memberId");
CREATE INDEX "NoteTask_projectId_idx" ON "NoteTask"("projectId");
CREATE INDEX "NoteTask_grantId_idx" ON "NoteTask"("grantId");
CREATE INDEX "NoteTask_eventId_idx" ON "NoteTask"("eventId");
CREATE INDEX "NoteTask_publicationId_idx" ON "NoteTask"("publicationId");
CREATE INDEX "NoteTask_documentId_idx" ON "NoteTask"("documentId");
CREATE INDEX "NoteTask_equipmentId_idx" ON "NoteTask"("equipmentId");
CREATE INDEX "NoteTask_collaboratorId_idx" ON "NoteTask"("collaboratorId");
CREATE INDEX "NoteTask_expenseId_idx" ON "NoteTask"("expenseId");
CREATE INDEX "NoteTask_protocolId_idx" ON "NoteTask"("protocolId");
CREATE INDEX "Member_name_idx" ON "Member"("name");
CREATE INDEX "Project_title_idx" ON "Project"("title");
CREATE UNIQUE INDEX "Protocol_documentId_key" ON "Protocol"("documentId");
CREATE INDEX "Protocol_title_idx" ON "Protocol"("title");
CREATE INDEX "Protocol_category_idx" ON "Protocol"("category");
CREATE INDEX "Protocol_authorId_idx" ON "Protocol"("authorId");
CREATE INDEX "Protocol_projectId_idx" ON "Protocol"("projectId");
CREATE UNIQUE INDEX "Publication_doi_key" ON "Publication"("doi");
CREATE INDEX "Publication_title_idx" ON "Publication"("title");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");
CREATE INDEX "SmsVerificationCode_userId_idx" ON "SmsVerificationCode"("userId");
CREATE INDEX "SmsVerificationCode_code_idx" ON "SmsVerificationCode"("code");
CREATE UNIQUE INDEX "WebAuthnChallenge_challenge_key" ON "WebAuthnChallenge"("challenge");
CREATE INDEX "WebAuthnChallenge_userId_idx" ON "WebAuthnChallenge"("userId");
CREATE INDEX "WebAuthnChallenge_challenge_idx" ON "WebAuthnChallenge"("challenge");
CREATE INDEX "WebAuthnChallenge_expiresAt_idx" ON "WebAuthnChallenge"("expiresAt");
CREATE INDEX "_CollaboratorToProject_B_index" ON "_CollaboratorToProject"("B");
CREATE INDEX "_EquipmentToEvent_B_index" ON "_EquipmentToEvent"("B");
CREATE INDEX "_EventToMember_B_index" ON "_EventToMember"("B");
CREATE INDEX "_EventToProject_B_index" ON "_EventToProject"("B");
CREATE INDEX "_GrantToProject_B_index" ON "_GrantToProject"("B");
CREATE INDEX "_ProjectMembers_B_index" ON "_ProjectMembers"("B");
CREATE INDEX "_MemberToPublication_B_index" ON "_MemberToPublication"("B");
CREATE INDEX "_ProjectToPublication_B_index" ON "_ProjectToPublication"("B");

-- AddForeignKey
ALTER TABLE "AcademicInfo" ADD CONSTRAINT "AcademicInfo_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NoteTask" ADD CONSTRAINT "NoteTask_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteTask" ADD CONSTRAINT "NoteTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteTask" ADD CONSTRAINT "NoteTask_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteTask" ADD CONSTRAINT "NoteTask_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteTask" ADD CONSTRAINT "NoteTask_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteTask" ADD CONSTRAINT "NoteTask_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteTask" ADD CONSTRAINT "NoteTask_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteTask" ADD CONSTRAINT "NoteTask_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "Collaborator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteTask" ADD CONSTRAINT "NoteTask_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteTask" ADD CONSTRAINT "NoteTask_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "Protocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SmsVerificationCode" ADD CONSTRAINT "SmsVerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebAuthnChallenge" ADD CONSTRAINT "WebAuthnChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CollaboratorToProject" ADD CONSTRAINT "_CollaboratorToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Collaborator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CollaboratorToProject" ADD CONSTRAINT "_CollaboratorToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_EquipmentToEvent" ADD CONSTRAINT "_EquipmentToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_EquipmentToEvent" ADD CONSTRAINT "_EquipmentToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_EventToMember" ADD CONSTRAINT "_EventToMember_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_EventToMember" ADD CONSTRAINT "_EventToMember_B_fkey" FOREIGN KEY ("B") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_EventToProject" ADD CONSTRAINT "_EventToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_EventToProject" ADD CONSTRAINT "_EventToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_GrantToProject" ADD CONSTRAINT "_GrantToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Grant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_GrantToProject" ADD CONSTRAINT "_GrantToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ProjectMembers" ADD CONSTRAINT "_ProjectMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ProjectMembers" ADD CONSTRAINT "_ProjectMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_MemberToPublication" ADD CONSTRAINT "_MemberToPublication_A_fkey" FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_MemberToPublication" ADD CONSTRAINT "_MemberToPublication_B_fkey" FOREIGN KEY ("B") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ProjectToPublication" ADD CONSTRAINT "_ProjectToPublication_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ProjectToPublication" ADD CONSTRAINT "_ProjectToPublication_B_fkey" FOREIGN KEY ("B") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

