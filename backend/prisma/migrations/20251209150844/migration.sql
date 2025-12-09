-- CreateTable
CREATE TABLE "job_applications_docs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "job_milestone_id" UUID,
    "client_id" UUID NOT NULL,
    "freelancer_id" UUID NOT NULL,
    "client_confirm" BOOLEAN NOT NULL DEFAULT false,
    "freelancer_confirm" BOOLEAN NOT NULL DEFAULT false,
    "deliverables" TEXT,
    "out_of_scope" TEXT,
    "budget" DECIMAL(65,30),
    "token_symbol" TEXT,
    "start_date" TIMESTAMPTZ(6),
    "end_date" TIMESTAMPTZ(6),

    CONSTRAINT "job_applications_docs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "job_applications_docs" ADD CONSTRAINT "job_applications_docs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications_docs" ADD CONSTRAINT "job_applications_docs_job_milestone_id_fkey" FOREIGN KEY ("job_milestone_id") REFERENCES "job_milestones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications_docs" ADD CONSTRAINT "job_applications_docs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications_docs" ADD CONSTRAINT "job_applications_docs_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
