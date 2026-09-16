import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { User, Building2, ShieldCheck, Palette, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import AppLayout from '@/layouts/app-layout';
import { PageHero } from '@/components/page-hero';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const sidebarNavItems = [
    {
        title: 'Profile',
        href: edit(),
        icon: User,
    },
    {
        title: 'Hotel Profile',
        href: '/settings/hotel',
        icon: Building2,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: ShieldCheck,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <AppLayout breadcrumbs={[{ title: 'Settings', href: '/settings/profile' }]}>
            <div className="flex flex-col gap-6 p-4 md:p-8 pt-6">
                <PageHero
                    badge="System Preferences"
                    badgeIcon={<Settings className="h-3.5 w-3.5" />}
                    title="Settings & Hotel Configuration"
                    description="Manage administrator profile, property metadata, access security credentials, and visual appearance themes."
                />

                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <aside className="w-full md:w-56 shrink-0">
                        <nav className="flex md:flex-col gap-1 p-1.5 bg-card rounded-xl border border-border/60 shadow-sm">
                            {sidebarNavItems.map((item, index) => {
                                const active = isCurrentOrParentUrl(item.href);
                                const Icon = item.icon;
                                return (
                                    <Button
                                        key={`${toUrl(item.href)}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            'w-full justify-start gap-2.5 font-medium rounded-lg h-9 transition-colors',
                                            active
                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-300 font-semibold'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                        )}
                                    >
                                        <Link href={item.href}>
                                            <Icon className="h-4 w-4 shrink-0" />
                                            {item.title}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </aside>

                    <main className="flex-1 w-full min-w-0">
                        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}
