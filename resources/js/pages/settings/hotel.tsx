import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Building2 } from 'lucide-react';
import type { FormEventHandler } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/layout';
import type { Hotel } from '@/types';

type PageProps = {
    hotel: Hotel;
    flash?: {
        success?: string;
        error?: string;
    };
};

export default function HotelSettings({ hotel }: { hotel: Hotel }) {
    const { flash } = usePage<PageProps>().props;

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name: hotel?.name || '',
        code: hotel?.code || '',
        address: hotel?.address || '',
        city: hotel?.city || '',
        country: hotel?.country || 'United States',
        phone: hotel?.phone || '',
        email: hotel?.email || '',
        website: hotel?.website || '',
        tax_number: hotel?.tax_number || '',
        currency: hotel?.currency || 'USD',
        currency_symbol: hotel?.currency_symbol || '$',
        check_in_time: hotel?.check_in_time || '14:00',
        check_out_time: hotel?.check_out_time || '11:00',
        status: hotel?.status || 'active',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/settings/hotel', {
            preserveScroll: true,
        });
    };

    return (
        <SettingsLayout>
            <Head title="Hotel Profile & Settings" />

            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <Heading
                            variant="small"
                            title="Hotel Profile & Operational Settings"
                            description="Configure your hotel branch details, currency, default check-in/out times, and tax info"
                        />
                    </div>
                </div>

                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Hotel Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                placeholder="e.g. Grand Horizon Hotel & Resort"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Hotel / Branch Code</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                placeholder="e.g. GH-01"
                            />
                            <InputError message={errors.code} />
                        </div>
                    </div>

                    {/* Address & Location */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            required
                            placeholder="100 Ocean Boulevard"
                        />
                        <InputError message={errors.address} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                required
                                placeholder="Miami"
                            />
                            <InputError message={errors.city} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                value={data.country}
                                onChange={(e) => setData('country', e.target.value)}
                                required
                                placeholder="United States"
                            />
                            <InputError message={errors.country} />
                        </div>
                    </div>

                    {/* Contact & Web */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                required
                                placeholder="+1 (555) 234-5678"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Official Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                placeholder="contact@grandhorizonhotel.com"
                            />
                            <InputError message={errors.email} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                value={data.website}
                                onChange={(e) => setData('website', e.target.value)}
                                placeholder="https://grandhorizonhotel.com"
                            />
                            <InputError message={errors.website} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tax_number">Tax / VAT Number</Label>
                            <Input
                                id="tax_number"
                                value={data.tax_number}
                                onChange={(e) => setData('tax_number', e.target.value)}
                                placeholder="US-84920412"
                            />
                            <InputError message={errors.tax_number} />
                        </div>
                    </div>

                    {/* Operational Settings */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Currency & Policies</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency Code</Label>
                                <Input
                                    id="currency"
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value.toUpperCase())}
                                    required
                                    placeholder="USD"
                                />
                                <InputError message={errors.currency} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency_symbol">Currency Symbol</Label>
                                <Input
                                    id="currency_symbol"
                                    value={data.currency_symbol}
                                    onChange={(e) => setData('currency_symbol', e.target.value)}
                                    required
                                    placeholder="$"
                                />
                                <InputError message={errors.currency_symbol} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="check_in_time">Standard Check-In Time</Label>
                                <Input
                                    id="check_in_time"
                                    type="time"
                                    value={data.check_in_time}
                                    onChange={(e) => setData('check_in_time', e.target.value)}
                                    required
                                />
                                <InputError message={errors.check_in_time} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="check_out_time">Standard Check-Out Time</Label>
                                <Input
                                    id="check_out_time"
                                    type="time"
                                    value={data.check_out_time}
                                    onChange={(e) => setData('check_out_time', e.target.value)}
                                    required
                                />
                                <InputError message={errors.check_out_time} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Hotel Settings'}
                        </Button>

                        {recentlySuccessful && (
                            <p className="text-sm text-green-600 font-medium">Saved successfully.</p>
                        )}
                    </div>
                </form>
            </div>
        </SettingsLayout>
    );
}

HotelSettings.layout = {
    breadcrumbs: [
        {
            title: 'Hotel Profile & Settings',
            href: '/settings/hotel',
        },
    ],
};
