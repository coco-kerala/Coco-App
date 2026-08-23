"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { RequestServiceModal } from "@/components/customer/RequestServiceModal";

const CustomerModalContext = createContext(null);

export function CustomerModalProvider({ children }) {
  const [showRequestModal, setShowRequestModal] = useState(false);

  const openRequestModal = useCallback(() => setShowRequestModal(true), []);
  const closeRequestModal = useCallback(() => setShowRequestModal(false), []);

  const value = useMemo(
    () => ({ openRequestModal, closeRequestModal }),
    [openRequestModal, closeRequestModal]
  );

  return (
    <CustomerModalContext.Provider value={value}>
      {children}
      <RequestServiceModal open={showRequestModal} onClose={closeRequestModal} />
    </CustomerModalContext.Provider>
  );
}

export function useCustomerModal() {
  const ctx = useContext(CustomerModalContext);
  if (!ctx) throw new Error("useCustomerModal must be used within CustomerModalProvider");
  return ctx;
}
