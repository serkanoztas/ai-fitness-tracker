"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
    onClose: () => void;
    /** Başlık elemanının id'si (aria-labelledby) */
    labelledBy: string;
    /** Açıklama elemanının id'si (aria-describedby) */
    describedBy?: string;
    children: ReactNode;
}

/**
 * Erişilebilir modal kabuğu: yerel <dialog> + showModal() üzerine kurulu.
 * Tarayıcı bizim için odak tuzağını, arka planı etkisiz kılmayı (inert), Esc ile kapatmayı ve ekran okuyucu rolünü sağlar.
 * Biz ek olarak: açılışta ilk uygun elemana odak, kapanışta önceki elemana geri odak, sayfa kaydırmasını kilitleme
 * ve arka plana tıklayınca kapatma ekleriz.
 *
 * Görünüm design-system.md'ye uyar: bulanık siyah perde, cam efektli zinc panel, merkezden ölçek animasyonu.
 * Yalnızca mount edildiğinde açılır; kapatmak için parent bileşeni unmount eder.
 */
export function Modal({ onClose, labelledBy, describedBy, children }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    // Metin seçerken fare arka plana taşarsa yanlışlıkla kapanmasın: basma da bırakma da perdede olmalı
    const pressStartedOnBackdrop = useRef(false);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;

        if (!dialog.open) dialog.showModal();
        document.body.style.overflow = "hidden";
        dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            if (dialog.open) dialog.close();
            previouslyFocused?.focus();
        };
    }, []);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            // Esc: tarayıcının kendi kapatmasını engelle, durumu parent yönetsin
            onCancel={(e) => {
                e.preventDefault();
                onClose();
            }}
            onMouseDown={(e) => {
                pressStartedOnBackdrop.current = e.target === e.currentTarget;
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && pressStartedOnBackdrop.current) onClose();
            }}
            // Tailwind preflight margin'i sıfırladığı için m-auto ile ortalanır
            className="m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-0 text-zinc-100 shadow-2xl shadow-black/50 backdrop-blur-md backdrop:bg-black/60 backdrop:backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200"
        >
            {children}
        </dialog>
    );
}

/** Modal içinde ortak kullanılan buton sınıfları */
export const MODAL_BUTTON_BASE =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:opacity-60 disabled:pointer-events-none";

export const MODAL_CANCEL_BUTTON = `${MODAL_BUTTON_BASE} border border-zinc-700/80 bg-zinc-800/60 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800`;

export const MODAL_CONFIRM_BUTTON = `${MODAL_BUTTON_BASE} bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/30 hover:from-violet-500 hover:to-indigo-500`;

export const MODAL_DANGER_BUTTON = `${MODAL_BUTTON_BASE} bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-900/30 hover:from-rose-500 hover:to-red-500 focus-visible:ring-rose-500/50`;
