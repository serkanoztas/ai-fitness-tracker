"use client";

import { useState } from "react";
import { Activity, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";
import { apiRequest, getErrorMessage } from "@/lib/api/client";

/**
 * AI Koç: gradyanlı banner (rapor isteme butonu) ve oluşan rapor.
 * Rapor banner'ın hemen altında, tam genişlikte görünür.
 */
export function AiCoach() {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const requestAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await apiRequest<{ analysis: string }>("/api/ai/analys", { method: "POST" });
            setAnalysis(result.analysis);
        } catch (err) {
            setError(getErrorMessage(err, "Analiz alınırken bir hata oluştu."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section aria-label="AI koç" className="space-y-4">
            <div className="flex items-center gap-4 rounded-3xl border border-brand-500/40 bg-ai-card p-4 shadow-sm backdrop-blur-md">
                <div
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm"
                >
                    <Bot className="h-6 w-6 text-white" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold tracking-wide text-white">AI Koç</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-300">
                        <Activity className="h-3 w-3 animate-pulse text-brand-400" aria-hidden="true" />
                        Verilerini incelemeye hazır
                    </p>
                </div>

                <button
                    onClick={requestAnalysis}
                    disabled={isLoading}
                    className="shrink-0 rounded-xl bg-gradient-coral px-4 py-2.5 text-sm font-bold text-white shadow-glow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-60"
                >
                    {isLoading ? "Hazırlanıyor…" : "Rapor İste"}
                </button>
            </div>

            {isLoading && (
                <LoadingRegion
                    label="AI koç raporu hazırlanıyor"
                    className="space-y-4 rounded-3xl border border-line bg-surface p-6 md:p-8"
                >
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-48 max-w-full" />
                            <Skeleton className="h-3.5 w-64 max-w-full" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-2/3" />
                </LoadingRegion>
            )}

            {error && (
                <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {analysis && (
                <article className="rounded-3xl border border-line bg-surface p-6 shadow-inner-glow animate-in fade-in zoom-in-95 duration-300 md:p-8">
                    <div className="mb-6 flex items-center gap-3 border-b border-line pb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-coral text-white shadow-glow-sm" aria-hidden="true">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold tracking-tight text-white">AI Koç Raporu</h3>
                            <p className="text-sm font-medium text-brand-400">Son antrenman ve beslenme verilerine dayalı özel analiz</p>
                        </div>
                    </div>

                    <div className="text-gray-200">
                        {/* node prop'u DOM elemanına yayılmasın diye ayıklanıyor */}
                        {/* eslint-disable @typescript-eslint/no-unused-vars */}
                        <ReactMarkdown
                            components={{
                                h1: ({ node: _node, ...props }) => <h1 className="mb-3 mt-6 text-2xl font-bold text-white" {...props} />,
                                h2: ({ node: _node, ...props }) => <h2 className="mb-3 mt-6 text-lg font-bold text-brand-300" {...props} />,
                                h3: ({ node: _node, ...props }) => <h3 className="mb-2 mt-4 text-base font-bold text-brand-300" {...props} />,
                                p: ({ node: _node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                ul: ({ node: _node, ...props }) => <ul className="mb-4 list-disc space-y-2 pl-5 marker:text-brand-500" {...props} />,
                                li: ({ node: _node, ...props }) => <li {...props} />,
                                strong: ({ node: _node, ...props }) => <strong className="font-bold text-brand-300" {...props} />,
                            }}
                        >
                            {analysis}
                        </ReactMarkdown>
                        {/* eslint-enable @typescript-eslint/no-unused-vars */}
                    </div>
                </article>
            )}
        </section>
    );
}
