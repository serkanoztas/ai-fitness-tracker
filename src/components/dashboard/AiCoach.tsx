"use client";

import { useState } from "react";
import { Activity, Bot, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";

/**
 * AI Koç kartı (buton) ve oluşan rapor. Fragment döndürür: kart, üstteki stat grid'inin 4. hücresi olur;
 * rapor ise grid'in tamamını kaplayarak altında görünür.
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
            const res = await fetch("/api/ai/analys");
            const result = await res.json();

            if (res.ok) {
                setAnalysis(result.analysis);
            } else {
                setError(result.error || "Analiz alınırken bir hata oluştu.");
            }
        } catch {
            setError("Sunucuya bağlanılamadı.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-6 rounded-3xl shadow-lg border border-indigo-500/50 text-white flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Zap className="w-24 h-24" />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                    <div>
                        <div className="p-3 bg-white/20 w-fit rounded-xl backdrop-blur-sm mb-4">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-white/80 text-sm font-medium mb-1">AI Analizi</h3>
                        <p className="text-lg font-bold leading-tight mt-2">Koçun verilerini incelemeye hazır.</p>
                    </div>
                    <button
                        onClick={requestAnalysis}
                        disabled={isLoading}
                        className="mt-4 py-2 px-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                    >
                        {isLoading ? (
                            <>
                                <Activity className="w-4 h-4 animate-spin" /> Bekleyin...
                            </>
                        ) : (
                            "Rapor İste"
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="col-span-full p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>
            )}

            {analysis && (
                <div className="col-span-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 p-6 md:p-8 rounded-3xl shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-indigo-200 dark:border-indigo-800">
                        <div className="p-3 bg-indigo-500 text-white rounded-xl shadow-md">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">AI Koç Raporu</h3>
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                                Son antrenman ve beslenme verilerine dayalı özel analiz
                            </p>
                        </div>
                    </div>

                    <div className="text-gray-800 dark:text-gray-200">
                        {/* node prop'u DOM elemanına yayılmasın diye ayıklanıyor */}
                        {/* eslint-disable @typescript-eslint/no-unused-vars */}
                        <ReactMarkdown
                            components={{
                                h1: ({ node: _node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-indigo-900 dark:text-indigo-300" {...props} />,
                                h2: ({ node: _node, ...props }) => <h2 className="text-xl font-bold mt-6 mb-3 text-indigo-800 dark:text-indigo-400" {...props} />,
                                h3: ({ node: _node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-indigo-700 dark:text-indigo-400" {...props} />,
                                p: ({ node: _node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                ul: ({ node: _node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-indigo-500" {...props} />,
                                li: ({ node: _node, ...props }) => <li {...props} />,
                                strong: ({ node: _node, ...props }) => <strong className="font-bold text-indigo-600 dark:text-indigo-400" {...props} />,
                            }}
                        >
                            {analysis}
                        </ReactMarkdown>
                        {/* eslint-enable @typescript-eslint/no-unused-vars */}
                    </div>
                </div>
            )}
        </>
    );
}
