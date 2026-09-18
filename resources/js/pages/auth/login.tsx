import { Form, Head } from '@inertiajs/react';
import { ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [demoEmail, setDemoEmail] = useState('');
    const [demoPassword, setDemoPassword] = useState('');

    const handleDemoFill = (roleEmail: string) => {
        setDemoEmail(roleEmail);
        setDemoPassword('password');
    };

    return (
        <>
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-3.5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-3">
                            {/* Email / Username Field */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Email or Username
                                </Label>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        value={demoEmail || undefined}
                                        onChange={(e) => setDemoEmail(e.target.value)}
                                        className="pl-10 h-10 rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-blue-600 focus-visible:ring-blue-500/20 text-sm dark:bg-zinc-900 dark:border-zinc-700"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3.5 size-4 text-slate-400 pointer-events-none z-10" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Password"
                                        value={demoPassword || undefined}
                                        onChange={(e) => setDemoPassword(e.target.value)}
                                        className="pl-10 h-10 rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-blue-600 focus-visible:ring-blue-500/20 text-sm dark:bg-zinc-900 dark:border-zinc-700 w-full"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center space-x-2 pt-0.5">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded-md border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 size-4"
                                />
                                <Label htmlFor="remember" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                                    Remember me
                                </Label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="mt-1 h-10.5 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <Spinner className="size-4" />
                                ) : (
                                    <>
                                        <span>Login</span>
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="relative my-0.5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2.5 text-[11px] text-slate-400 font-medium tracking-wider dark:bg-zinc-900 dark:text-zinc-500">
                                    OR
                                </span>
                            </div>
                        </div>

                        {/* Quick Demo Fill Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleDemoFill('admin@hotel.com')}
                                className="h-9 rounded-xl border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs font-medium text-slate-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Sparkles className="size-3 text-blue-600 dark:text-blue-400" />
                                Demo Admin
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleDemoFill('reception@hotel.com')}
                                className="h-9 rounded-xl border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs font-medium text-slate-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Sparkles className="size-3 text-emerald-600 dark:text-emerald-400" />
                                Demo Front Desk
                            </Button>
                        </div>

                        {/* Bottom Link */}
                        <div className="text-center text-xs text-slate-500 dark:text-zinc-400 pt-0.5">
                            Don't have an account?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={6}
                                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline-offset-4 hover:underline"
                            >
                                Create one
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-3 text-center text-xs font-medium text-emerald-600 bg-emerald-50 py-2 rounded-lg dark:bg-emerald-950/50 dark:text-emerald-400">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Welcome Back!',
    description: 'Sign in to your account to continue',
};

