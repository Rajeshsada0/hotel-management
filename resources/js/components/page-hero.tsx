import type { LucideIcon } from 'lucide-react';
import { isValidElement } from 'react';
import type { ElementType, ReactNode } from 'react';

interface PageHeroProps {
    badge?: string;
    badgeIcon?: LucideIcon | ReactNode;
    title: string;
    description?: string;
    children?: ReactNode;
    actions?: ReactNode;
    bgImage?: string;
    gradientClass?: string;
    className?: string;
}

export function resolveBannerGradient(gradientOrColor?: string | null): string {
    if (!gradientOrColor) {
        return 'linear-gradient(to right, #143d91 0%, rgba(26, 74, 185, 0.95) 45%, transparent 100%)';
    }

    if (gradientOrColor.startsWith('linear-gradient') || gradientOrColor.startsWith('#') || gradientOrColor.startsWith('rgb')) {
        if (gradientOrColor.startsWith('#')) {
            return `linear-gradient(to right, ${gradientOrColor} 0%, ${gradientOrColor}f0 45%, transparent 100%)`;
        }
        return gradientOrColor;
    }

    const fromMatch = gradientOrColor.match(/from-\[#([0-9a-fA-F]+)\]/);
    const viaMatch = gradientOrColor.match(/via-\[#([0-9a-fA-F]+)\]/);

    if (fromMatch && viaMatch) {
        return `linear-gradient(to right, #${fromMatch[1]} 0%, #${viaMatch[1]}f0 45%, transparent 100%)`;
    }

    if (fromMatch) {
        return `linear-gradient(to right, #${fromMatch[1]} 0%, #${fromMatch[1]}f0 45%, transparent 100%)`;
    }

    if (gradientOrColor.includes('064e3b') || gradientOrColor.toLowerCase().includes('emerald')) {
        return 'linear-gradient(to right, #064e3b 0%, rgba(4, 120, 87, 0.95) 45%, transparent 100%)';
    }
    if (gradientOrColor.includes('0b192c') || gradientOrColor.toLowerCase().includes('navy')) {
        return 'linear-gradient(to right, #0b192c 0%, rgba(30, 62, 98, 0.95) 45%, transparent 100%)';
    }
    if (gradientOrColor.includes('1e1b4b') || gradientOrColor.toLowerCase().includes('indigo')) {
        return 'linear-gradient(to right, #1e1b4b 0%, rgba(55, 48, 163, 0.95) 45%, transparent 100%)';
    }
    if (gradientOrColor.includes('7c2d12') || gradientOrColor.toLowerCase().includes('amber')) {
        return 'linear-gradient(to right, #7c2d12 0%, rgba(194, 65, 12, 0.95) 45%, transparent 100%)';
    }

    return 'linear-gradient(to right, #143d91 0%, rgba(26, 74, 185, 0.95) 45%, transparent 100%)';
}

export function PageHero({
    badge,
    badgeIcon,
    title,
    description,
    children,
    actions,
    bgImage = '/images/dashboard-banner.jpg',
    gradientClass = 'bg-gradient-to-r from-[#143d91] via-[#1a4ab9]/95 via-45% to-transparent',
    className = '',
}: PageHeroProps) {
    const actionElements = actions || children;

    const renderBadgeIcon = () => {
        if (!badgeIcon) return null;
        if (isValidElement(badgeIcon)) {
            return badgeIcon;
        }
        const Icon = badgeIcon as ElementType;
        return <Icon className="h-3.5 w-3.5 text-blue-200 shrink-0" />;
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl border border-border/40 shadow-sm min-h-[140px] p-6 sm:p-7 text-white ${className}`}>
            {/* Background image & gradient overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
                style={{ backgroundImage: `url('${bgImage}')` }}
            />
            <div
                className="absolute inset-0 z-0"
                style={{ background: resolveBannerGradient(gradientClass) }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1.5">
                    {badge && (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium text-blue-100 backdrop-blur-md border border-white/20">
                            {renderBadgeIcon()}
                            <span>{badge}</span>
                        </div>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-blue-100/90 max-w-2xl leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                {actionElements && (
                    <div className="flex flex-wrap items-center gap-2.5 sm:self-center shrink-0">
                        {actionElements}
                    </div>
                )}
            </div>
        </div>
    );
}
