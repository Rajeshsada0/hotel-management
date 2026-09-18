import { Form, Head } from '@inertiajs/react';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-3.5">
                            {/* Name Field */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Full Name
                                </Label>
                                <div className="relative flex items-center">
                                    <User className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="John Doe"
                                        className="pl-10 h-11 rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-blue-600 focus-visible:ring-blue-500/20 text-sm dark:bg-zinc-900 dark:border-zinc-700"
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            {/* Email Address Field */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Email address
                                </Label>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="email@example.com"
                                        className="pl-10 h-11 rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-blue-600 focus-visible:ring-blue-500/20 text-sm dark:bg-zinc-900 dark:border-zinc-700"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Password
                                </Label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3.5 size-4 text-slate-400 pointer-events-none z-10" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        placeholder="Password"
                                        passwordrules={passwordRules}
                                        className="pl-10 h-11 rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-blue-600 focus-visible:ring-blue-500/20 text-sm dark:bg-zinc-900 dark:border-zinc-700 w-full"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Password Confirmation Field */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password_confirmation" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Confirm password
                                </Label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3.5 size-4 text-slate-400 pointer-events-none z-10" />
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        placeholder="Confirm password"
                                        passwordrules={passwordRules}
                                        className="pl-10 h-11 rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-blue-600 focus-visible:ring-blue-500/20 text-sm dark:bg-zinc-900 dark:border-zinc-700 w-full"
                                    />
                                </div>
                                <InputError message={errors.password_confirmation} />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                tabIndex={5}
                                disabled={processing}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <Spinner className="size-4" />
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Bottom Link */}
                        <div className="text-center text-xs sm:text-sm text-slate-500 dark:text-zinc-400 pt-2">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline-offset-4 hover:underline"
                            >
                                Sign in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create an Account',
    description: 'Enter your details below to get started',
};
