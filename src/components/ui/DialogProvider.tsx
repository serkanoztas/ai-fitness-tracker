"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { ConfirmModal, type ConfirmModalProps } from "@/components/ui/ConfirmModal";
import { PromptModal, type PromptModalProps } from "@/components/ui/PromptModal";

export type ConfirmOptions = Pick<ConfirmModalProps, "title" | "description" | "confirmLabel" | "cancelLabel" | "tone">;

export type PromptOptions = Pick<
    PromptModalProps,
    "title" | "description" | "label" | "placeholder" | "initialValue" | "confirmLabel" | "cancelLabel" | "maxLength" | "validate"
>;

interface DialogApi {
    /** Onay penceresi açar. Onaylanırsa true, vazgeçilirse (Vazgeç, Esc, perdeye tıklama) false döner. */
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    /** Metin girdisi penceresi açar. Kaydedilirse kırpılmış metin, vazgeçilirse null döner. */
    prompt: (options: PromptOptions) => Promise<string | null>;
}

type ActiveDialog =
    | { id: number; kind: "confirm"; options: ConfirmOptions; resolve: (value: boolean) => void }
    | { id: number; kind: "prompt"; options: PromptOptions; resolve: (value: string | null) => void };

const DialogContext = createContext<DialogApi | null>(null);

/** Uygulamanın kökünde bir kez yer alır; useDialogs() ile promise tabanlı confirm/prompt sağlar. */
export function DialogProvider({ children }: { children: ReactNode }) {
    const [active, setActive] = useState<ActiveDialog | null>(null);
    const activeRef = useRef<ActiveDialog | null>(null);
    const nextId = useRef(0);

    // Açık bir pencere varken yenisi istenirse eskisi "vazgeçildi" sayılır; promise'ler asılı kalmaz.
    const open = useCallback((next: ActiveDialog) => {
        const previous = activeRef.current;
        if (previous?.kind === "confirm") previous.resolve(false);
        if (previous?.kind === "prompt") previous.resolve(null);
        activeRef.current = next;
        setActive(next);
    }, []);

    const api = useMemo<DialogApi>(
        () => ({
            confirm: (options) =>
                new Promise<boolean>((resolve) => open({ id: nextId.current++, kind: "confirm", options, resolve })),
            prompt: (options) =>
                new Promise<string | null>((resolve) => open({ id: nextId.current++, kind: "prompt", options, resolve })),
        }),
        [open]
    );

    const settleConfirm = (result: boolean) => {
        if (active?.kind !== "confirm") return;
        activeRef.current = null; // open() aynı promise'i ikinci kez çözmesin
        active.resolve(result);
        setActive(null);
    };

    const settlePrompt = (result: string | null) => {
        if (active?.kind !== "prompt") return;
        activeRef.current = null;
        active.resolve(result);
        setActive(null);
    };

    return (
        <DialogContext.Provider value={api}>
            {children}
            {active?.kind === "confirm" && (
                <ConfirmModal
                    key={active.id}
                    open
                    {...active.options}
                    onConfirm={() => settleConfirm(true)}
                    onCancel={() => settleConfirm(false)}
                />
            )}
            {active?.kind === "prompt" && (
                <PromptModal
                    key={active.id}
                    open
                    {...active.options}
                    onSubmit={(value) => settlePrompt(value)}
                    onCancel={() => settlePrompt(null)}
                />
            )}
        </DialogContext.Provider>
    );
}

export function useDialogs(): DialogApi {
    const ctx = useContext(DialogContext);
    if (!ctx) throw new Error("useDialogs yalnızca <DialogProvider> içinde kullanılabilir.");
    return ctx;
}
