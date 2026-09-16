import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { isValidElement } from 'react';
import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type StatColor = 'blue' | 'emerald' | 'purple' | 'amber' | 'sky' | 'rose';

interface StatCardProps {
    title: string;
    value: string | number | ReactNode;
    subtitle?: string | ReactNode;
    description?: string | ReactNode;
    icon: LucideIcon | ReactNode;
    color?: StatColor;
    variant?: StatColor;
    href?: string;
    showWave?: boolean;
    className?: string;
}

const colorStyles: Record<StatColor, { iconBg: string; iconText: string; valueText: string }> = {
    blue: {
        iconBg: 'bg-blue-100 dark:bg-blue-950/60',
        iconText: 'text-blue-600 dark:text-blue-400',
        valueText: 'text-blue-600 dark:text-blue-400',
    },
    emerald: {
        iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
        iconText: 'text-emerald-600 dark:text-emerald-400',
        valueText: 'text-slate-800 dark:text-slate-100',
    },
    purple: {
        iconBg: 'bg-purple-100 dark:bg-purple-950/60',
        iconText: 'text-purple-600 dark:text-purple-400',
        valueText: 'text-slate-800 dark:text-slate-100',
    },
    amber: {
        iconBg: 'bg-orange-100 dark:bg-orange-950/60',
        iconText: 'text-orange-500 dark:text-orange-400',
        valueText: 'text-slate-800 dark:text-slate-100',
    },
    sky: {
        iconBg: 'bg-teal-100 dark:bg-teal-950/60',
        iconText: 'text-teal-600 dark:text-teal-400',
        valueText: 'text-emerald-600 dark:text-emerald-400',
    },
    rose: {
        iconBg: 'bg-rose-100 dark:bg-rose-950/60',
        iconText: 'text-rose-500 dark:text-rose-400',
        valueText: 'text-orange-500 dark:text-orange-400',
    },
};

export function StatCard({
    title,
    value,
    subtitle,
    description,
    icon: Icon,
    color,
    variant,
    href,
    showWave = false,
    className,
}: StatCardProps) {
    const finalColor: StatColor = color || variant || 'blue';
    const finalSubtitle = subtitle || description;
    const palette = colorStyles[finalColor] || colorStyles.blue;

    const renderIcon = () => {
        if (!Icon) return null;
        if (isValidElement(Icon)) return Icon;
        const Component = Icon as ElementType;
        return <Component className="h-5 w-5" />;
    };

    const content = (
        <div
            className={cn(
                'group relative flex flex-col rounded-xl border border-border/50 bg-white dark:bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border',
                href && 'cursor-pointer',
                className
            )}
        >
            {/* Top row: icon left, chevron right */}
            <div className="flex items-start justify-between mb-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', palette.iconBg, palette.iconText)}>
                    {renderIcon()}
                </div>
                <ChevronRight className={cn(
                    'h-4 w-4 mt-1 transition-transform duration-200',
                    href
                        ? 'text-muted-foreground/40 group-hover:translate-x-0.5 group-hover:text-muted-foreground'
                        : 'text-muted-foreground/20'
                )} />
            </div>

            {/* Title */}
            <div className="text-xs font-medium text-muted-foreground tracking-tight mb-0.5">
                {title}
            </div>

            {/* Value */}
            <div className={cn('text-2xl font-bold tracking-tight leading-tight', palette.valueText)}>
                {value}
                {showWave && (
                    <svg className="inline-block ml-2 h-5 w-12 opacity-50" viewBox="0 0 60 20" fill="none">
                        <path
                            d="M2 16 C 12 16, 18 10, 26 12 C 34 14, 40 4, 58 4"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                    </svg>
                )}
            </div>

            {/* Subtitle */}
            {finalSubtitle && (
                <div className="mt-1 text-xs text-muted-foreground leading-tight">
                    {finalSubtitle}
                </div>
            )}
        </div>
    );

    if (href) {
        return <Link href={href} className="block">{content}</Link>;
    }

    return content;
}
