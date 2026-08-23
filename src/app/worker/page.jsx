import { WorkerHomeClient } from "./WorkerHomeClient";

export default async function WorkerPage({ searchParams }) {
  const params = await searchParams;
  const jobId = typeof params?.job === "string" ? params.job : null;
  return <WorkerHomeClient selectedJobId={jobId} />;
}
