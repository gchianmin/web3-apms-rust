-- CreateTable
CREATE TABLE "Reviewer" (
    "id" SERIAL NOT NULL,
    "conference_pda" TEXT NOT NULL,
    "conference_id" TEXT NOT NULL,
    "conference_name" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "paper_title" TEXT NOT NULL,
    "reviewer_email" TEXT NOT NULL,
    "reviewer_name" TEXT NOT NULL,
    "invitation_sent" INTEGER NOT NULL,
    "invitation_sent_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invitation_exp" TIMESTAMP(3) NOT NULL,
    "acceptance" INTEGER NOT NULL,

    CONSTRAINT "Reviewer_pkey" PRIMARY KEY ("id")
);
