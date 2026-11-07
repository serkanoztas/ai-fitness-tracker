"use client";

import { useId } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { MODAL_CANCEL_BUTTON, MODAL_CONFIRM_BUTTON, MODAL_DANGER_BUTTON, Modal } from "@/components/ui/Modal";

export interface ConfirmModalProps {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** "danger": geri alınamaz işlemler (silme). Odak güvenli seçenek olan "Vazgeç"te başlar. */
    tone?: "default" | "danger";
    onConfirm: () => void;
    onCancel: () => void;
}

/** window.confirm() yerine geçen onay penceresi. */
export function ConfirmModal({
    open,
    title,
    description,
    confirmLabel = "Onayla",
    cancelLabel = "Vazgeç",
    tone = "default",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const titleId = useId();
    const descriptionId = useId();

    if (!open) return null;

    const isDanger = tone === "danger";
    const Icon = isDanger ? AlertTriangle : HelpCircle;

    return (
        <Modal onClose={onCancel} labelledBy={titleId} describedBy={description ? descriptionId : undefined}>
            <div className="px-4 py-6 sm:px-6">
                <div className="flex items-start gap-4">
                    <div
                        aria-hidden="true"
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                            isDanger
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                                : "border-violet-500/30 bg-violet-500/10 text-violet-400"
                        }`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <h2 id={titleId} className="text-lg font-semibold tracking-tight text-zinc-100">
                            {title}
                        </h2>
                        {description && (
                            <p id={descriptionId} className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onCancel} data-autofocus={isDanger ? "" : undefined} className={MODAL_CANCEL_BUTTON}>
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        data-autofocus={isDanger ? undefined : ""}
                        className={isDanger ? MODAL_DANGER_BUTTON : MODAL_CONFIRM_BUTTON}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
