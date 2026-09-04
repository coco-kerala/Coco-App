"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { useGreeting } from "@/hooks/useGreeting";
import { useT } from "@/contexts/LanguageContext";
import { getJobsByWorker } from "@/lib/data/store";
import { JobCard } from "@/components/worker/JobCard";
import { JobDetailModal } from "@/components/worker/JobDetailModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function WorkerHomeClient({ selectedJobId }) {
  const { user } = useAuth();
  const { version, ready } = useAppData();
  const greeting = useGreeting();
  const { t } = useT();

  const jobs = useMemo(
    () => (ready ? getJobsByWorker(user.id).filter((j) => j.status !== "completed") : []),
    [user.id, version, ready]
  );
  const firstJob = jobs[0];

  return (
    <>
      <div className="px-5 pt-4">
        <p className="text-coco-muted font-medium text-base">
          {greeting}, {user.name.split(" ")[0]}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-coco-ink tracking-tight">
          {t("worker.todaysJobs")}
        </h1>
        <p className="mt-1 text-sm text-coco-muted">{t("worker.simpleHint")}</p>

        <Card className="mt-5 bg-coco-green text-white border-0 py-5">
          <p className="text-white/80 text-base">{t("worker.assignedToYou")}</p>
          <p className="text-4xl font-extrabold mt-1">
            {jobs.length} {jobs.length === 1 ? t("worker.job") : t("worker.jobs")}
          </p>
        </Card>

        {firstJob && (
          <Button
            fullWidth
            size="lg"
            className="mt-4 h-14 text-lg"
            navTo="/worker"
            navParams={{ job: firstJob.id }}
          >
            {t("worker.openNextJob")}
          </Button>
        )}

        <div className="mt-6 space-y-4">
          {ready && jobs.length === 0 ? (
            <Card padding="none">
              <EmptyState
                compact
                title={t("worker.noOpenJobs")}
                description={t("worker.noOpenJobsDesc")}
                actionLabel={t("worker.viewSampleJob")}
                navTo="/worker"
                navParams={{ job: "job_1" }}
              />
            </Card>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </div>

      <JobDetailModal
        jobId={selectedJobId}
        onClose={() => { window.location.href = "/worker"; }}
      />
    </>
  );
}
