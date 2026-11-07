"use client";

import { useId, useState } from "react";
import { PencilLine } from "lucide-react";
import { MODAL_CANCEL_BUTTON, MODAL_CONFIRM_BUTTON, Modal } from "@/components/ui/Modal";

export interface PromptModalProps {
    open: boolean;
    title: string;
    description?: string;
    /** Girdi alanının görünür etiketi */
    label: string;
    placeholder?: string;
    initialValue?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    maxLength?: number;
    /** Kırpılmış değer için hata mesajı döndürür; null ise geçerlidir. Boş değer her zaman reddedilir. */
    validate?: (value: string) => string | null;
    onSubmit: (value: string) => void;
    onCancel: () => void;
}

const INPUT_CLASS =
    "w-full rounded-xl border bg-canvas/70 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:ring-2";

/** window.prompt() yerine geçen metin girdi penceresi. */
export function PromptModal(props: PromptModalProps) {
    if (!props.open) return null;
    // İçerik ayrı bileşende: her açılışta state (girdi, hata) sıfırdan başlar.
    return <PromptModalContent {...props} />;
}

function PromptModalContent({
    title,
    description,
    label,
    placeholder,
    initialValue = "",
    confirmLabel = "Kaydet",
    cancelLabel = "Vazgeç",
    maxLength = 60,
    validate,
    onSubmit,
    onCancel,
}: PromptModalProps) {
    const titleId = useId();
    const descriptionId = useId();
    const inputId = useId();
    const errorId = useId();

    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = value.trim();

        const problem = trimmed ? (validate?.(trimmed) ?? null) : `${label} boş olamaz.`;
        if (problem) {
            setError(problem);
            return;
        }
        onSubmit(trimmed);
    };

    const describedBy = [description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

    return (
        <Modal onClose={onCancel} labelledBy={titleId} describedBy={description ? descriptionId : undefined}>
            <form onSubmit={handleSubmit} noValidate className="px-4 py-6 sm:px-6">
                <div className="flex items-start gap-4">
                    <div
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-400"
                    >
                        <PencilLine className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <h2 id={titleId} className="text-lg font-semibold tracking-tight text-white">
                            {title}
                        </h2>
                        {description && (
                            <p id={descriptionId} className="mt-1.5 text-sm leading-relaxed text-gray-400">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-5">
                    <label htmlFor={inputId} className="mb-2 block text-xs font-medium text-gray-400">
                        {label}
                    </label>
                    <input
                        id={inputId}
                        type="text"
                        data-autofocus
                        autoComplete="off"
                        maxLength={maxLength}
                        value={value}
                        placeholder={placeholder}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={describedBy}
                        onChange={(e) => {
                            setValue(e.target.value);
                            if (error) setError(null);
                        }}
                        onFocus={(e) => e.currentTarget.select()}
                        className={`${INPUT_CLASS} ${
                            error
                                ? "border-rose-500/60 focus:border-rose-500/60 focus:ring-rose-500/40"
                                : "border-line focus:border-brand-500/60 focus:ring-brand-500/50"
                        }`}
                    />
                    <div className="mt-1.5 flex items-start justify-between gap-3 text-xs">
                        <p id={errorId} role="alert" className="text-rose-400">
                            {error}
                        </p>
                        <span className="shrink-0 text-gray-500">
                            {value.length}/{maxLength}
                        </span>
                    </div>
                </div>

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onCancel} className={MODAL_CANCEL_BUTTON}>
                        {cancelLabel}
                    </button>
                    <button type="submit" className={MODAL_CONFIRM_BUTTON}>
                        {confirmLabel}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
