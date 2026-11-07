import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateAction {
    label: string;
    /** Verilirse bağlantı, verilmezse buton olarak render edilir */
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
}

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: EmptyStateAction;
    /** Başka bir kartın içinde (çerçevesiz) kullanım için */
    bare?: boolean;
    className?: string;
}

const ACTION_CLASS =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-coral px-4 py-2.5 text-sm font-semibold tracking-tight text-white shadow-glow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50";

/** İkon çıpalı, yönlendirici aksiyonlu boş durum kartı. */
export function EmptyState({ icon: Icon, title, description, action, bare = false, className = "" }: EmptyStateProps) {
    const ActionIcon = action?.icon;

    return (
        <div
            className={`flex flex-col items-center justify-center px-4 py-10 text-center sm:px-8 ${
                bare
                    ? ""
                    : "rounded-3xl border border-line bg-surface shadow-inner-glow"
            } ${className}`}
        >
            <div
                aria-hidden="true"
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-500/20 bg-brand-500/10 text-brand-400"
            >
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-white">{title}</h3>
            {description && <p className="mt-1.5 max-w-sm text-sm text-gray-400">{description}</p>}

            {action &&
                (action.href ? (
                    <Link href={action.href} className={`${ACTION_CLASS} mt-5`}>
                        {ActionIcon && <ActionIcon className="h-4 w-4" />}
                        {action.label}
                    </Link>
                ) : (
                    <button type="button" onClick={action.onClick} className={`${ACTION_CLASS} mt-5`}>
                        {ActionIcon && <ActionIcon className="h-4 w-4" />}
                        {action.label}
                    </button>
                ))}
        </div>
    );
}
