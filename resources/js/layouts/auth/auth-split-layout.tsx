import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BedDouble,
    Coffee,
    ConciergeBell,
    UtensilsCrossed,
} from 'lucide-react';
import { home, login, register } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;
    const page = usePage();
    const currentUrl = page.url || '';

    const isLogin =
        currentUrl === '/' ||
        currentUrl.startsWith('/login');
    const isRegister = currentUrl.startsWith('/register');
    const isAuthTab = isLogin || isRegister;

    const brandName = name && name !== 'Laravel' ? name : 'Lumina Hotel & POS';

    // Extract layout metadata if defined on the page component
    const layoutProps =
        (children as { type?: { layout?: { title?: string; description?: string } } })?.type?.layout || {};
    const displayTitle =
        title ||
        layoutProps.title ||
        (isLogin ? 'Welcome Back!' : isRegister ? 'Create an Account' : 'Welcome');
    const displayDescription =
        description ||
        layoutProps.description ||
        (isLogin
            ? 'Sign in to your account to continue'
            : isRegister
              ? 'Get started with hotel & restaurant management'
              : '');

    return (
        <div className="relative h-screen max-h-screen w-screen max-w-full overflow-hidden bg-[#F2F6FE] text-slate-900 antialiased flex items-center justify-center p-2 sm:p-4 lg:p-6 dark:bg-zinc-950 dark:text-zinc-100">
            {/* Ambient background decoration shapes strictly contained */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-16 -bottom-16 size-[320px] rounded-full bg-blue-200/50 blur-3xl dark:bg-blue-950/30" />
                <div className="absolute -right-16 -top-16 size-[360px] rounded-full bg-indigo-100/60 blur-3xl dark:bg-indigo-950/20" />
            </div>

            {/* Main Split Container */}
            <div className="relative z-10 w-full max-w-[1180px] h-full max-h-[calc(100vh-1.5rem)] lg:max-h-[640px] rounded-3xl bg-white shadow-2xl shadow-blue-950/10 border border-slate-100/80 dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden grid lg:grid-cols-12">
                {/* Left Showcase Banner */}
                <div
                    className="relative hidden lg:col-span-6 xl:col-span-7 lg:flex flex-col justify-between overflow-hidden bg-cover bg-center p-8 xl:p-10"
                    style={{ backgroundImage: "url('/images/auth-bg.jpg')" }}
                >
                    {/* Soft gradient glass overlay to guarantee text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white/20 dark:from-zinc-950/95 dark:via-zinc-950/80 dark:to-zinc-950/25 pointer-events-none" />

                    {/* Top Section: Brand + Headline + Features */}
                    <div className="relative z-10 space-y-5 max-w-xl">
                        {/* Brand Logo & Title */}
                        <Link href={home()} className="inline-flex items-center gap-3 group">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-transform group-hover:scale-105">
                                <Coffee className="size-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                                    {brandName}
                                </span>
                                <span className="text-[11px] font-medium text-slate-500 tracking-wide dark:text-slate-400">
                                    PMS – Hotel, Resort & Restaurant Management
                                </span>
                            </div>
                        </Link>

                        {/* Catchy Headline */}
                        <div className="space-y-2 pt-1">
                            <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                                Manage Your Hotel <br />
                                <span className="text-blue-600 dark:text-blue-400">Smarter & Easier</span>
                            </h1>
                            <p className="text-xs xl:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md font-normal">
                                Streamline reservations, front desk, housekeeping, restaurant POS, and billing — all in one place.
                            </p>
                        </div>

                        {/* Feature Badges List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-xs dark:bg-blue-900/60 dark:text-blue-300">
                                    <ConciergeBell className="size-4" />
                                </div>
                                <span className="text-xs xl:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Fast & Easy POS
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-xs dark:bg-blue-900/60 dark:text-blue-300">
                                    <BedDouble className="size-4" />
                                </div>
                                <span className="text-xs xl:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Table & Reservation
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-xs dark:bg-blue-900/60 dark:text-blue-300">
                                    <UtensilsCrossed className="size-4" />
                                </div>
                                <span className="text-xs xl:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Kitchen Display (KDS)
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-xs dark:bg-blue-900/60 dark:text-blue-300">
                                    <BarChart3 className="size-4" />
                                </div>
                                <span className="text-xs xl:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Reports & Analytics
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status Pill */}
                    <div className="relative z-10 pt-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur-md dark:bg-zinc-900/90 dark:text-zinc-300 border border-white/60 dark:border-zinc-700">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Cloud Hospitality OS • Front Desk Active</span>
                        </div>
                    </div>
                </div>

                {/* Right Form Area */}
                <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-6 py-6 sm:px-10 xl:px-12 bg-white dark:bg-zinc-900 overflow-y-auto">
                    <div className="mx-auto w-full max-w-[390px] flex flex-col justify-center">
                        {/* Mobile Header Brand */}
                        <div className="mb-4 flex lg:hidden items-center justify-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                                <Coffee className="size-4" />
                            </div>
                            <span className="text-base font-bold text-slate-900 dark:text-white">
                                {brandName}
                            </span>
                        </div>

                        {/* Top Tab Switcher: Login / Register */}
                        {isAuthTab && (
                            <div className="mb-4 flex items-center justify-center border-b border-slate-200 dark:border-zinc-800">
                                <Link
                                    href={login()}
                                    className={`relative pb-2.5 px-6 text-sm sm:text-base font-semibold transition-all ${
                                        isLogin
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300'
                                    }`}
                                >
                                    Login
                                </Link>
                                <Link
                                    href={register()}
                                    className={`relative pb-2.5 px-6 text-sm sm:text-base font-semibold transition-all ${
                                        isRegister
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300'
                                    }`}
                                >
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Title & Description */}
                        <div className="mb-4 text-center space-y-1">
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {displayTitle}
                            </h2>
                            {displayDescription && (
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                                    {displayDescription}
                                </p>
                            )}
                        </div>

                        {/* Form Content */}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
