"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { JobDetailModal } from "@/components/worker/JobDetailModal";

const WorkerModalContext = createContext(null);

export function WorkerModalProvider({ children }) {
  const [selectedJobId, setSelectedJobId] = useState(null);

  const openJobModal = useCallback((jobId) => setSelectedJobId(jobId), []);
  const closeJobModal = useCallback(() => setSelectedJobId(null), []);

  const value = useMemo(
    () => ({ openJobModal, closeJobModal }),
    [openJobModal, closeJobModal]
  );

  return (
    <WorkerModalContext.Provider value={value}>
      {children}
      <JobDetailModal jobId={selectedJobId} onClose={closeJobModal} />
    </WorkerModalContext.Provider>
  );
}

export function useWorkerModal() {
  const ctx = useContext(WorkerModalContext);
  if (!ctx) throw new Error("useWorkerModal must be used within WorkerModalProvider");
  return ctx;
}
