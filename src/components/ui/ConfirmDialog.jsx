"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", variant = "danger" }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-coco-muted leading-relaxed">{message}</p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" fullWidth onClick={onClose}>Cancel</Button>
        <Button variant={variant} fullWidth onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
