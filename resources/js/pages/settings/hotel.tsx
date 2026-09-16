import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Building2, Image as ImageIcon, Palette, Sparkles } from 'lucide-react';
import type { FormEventHandler } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resolveBannerGradient } from '@/components/page-hero';
import type { Hotel } from '@/types';

type PageProps = {
    hotel: Hotel;
    flash?: {
        success?: string;
        error?: string;
    };
};

const BANNER_IMAGE_PRESETS = [
    {
        name: 'Sunset Luxury Resort (Reference Default)',
        url: '/images/dashboard-banner.jpg',
    },
    {
        name: 'Horizon Twilight Pool',
        url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1920&q=80',
    },
    {
        name: 'Tropical Palm Villas',
        url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80',
    },
    {
        name: 'Grand Hotel & Spa',
        url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80',
    },
];

const BANNER_COLOR_PRESETS = [
    {
        name: 'Royal Blue (Reference Design)',
        gradient: 'bg-gradient-to-r from-[#143d91] via-[#1a4ab9]/95 via-45% to-transparent',
        hex: '#1a4ab9',
    },
    {
        name: 'Deep Ocean Navy',
        gradient: 'bg-gradient-to-r from-[#0b192c] via-[#1e3e62]/95 via-45% to-transparent',
        hex: '#1e3e62',
    },
    {
        name: 'Indigo Twilight',
        gradient: 'bg-gradient-to-r from-[#1e1b4b] via-[#3730a3]/95 via-45% to-transparent',
        hex: '#3730a3',
    },
    {
        name: 'Emerald Oasis',
        gradient: 'bg-gradient-to-r from-[#064e3b] via-[#047857]/95 via-45% to-transparent',
        hex: '#047857',
    },
    {
        name: 'Warm Amber Dusk',
        gradient: 'bg-gradient-to-r from-[#7c2d12] via-[#c2410c]/95 via-45% to-transparent',
        hex: '#c2410c',
    },
];

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
        banner_image: hotel?.banner_image || '/images/dashboard-banner.jpg',
        banner_color: hotel?.banner_color || 'bg-gradient-to-r from-[#143d91] via-[#1a4ab9]/95 via-45% to-transparent',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/settings/hotel', {
            preserveScroll: true,
        });
    };

    return (
        <>
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

                    {/* Hero Banner & Dashboard Branding */}
                    <div className="border-t pt-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4 text-blue-600" />
                                    Hero Banner & Dashboard Branding
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Customize the hero banner photo and gradient overlay displayed on the dashboard and main pages
                                </p>
                            </div>
                        </div>

                        {/* Live Banner Mini-Preview */}
                        <div className="relative overflow-hidden rounded-xl border border-border/40 min-h-[110px] p-4 text-white shadow-sm">
                            <div
                                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
                                style={{ backgroundImage: `url('${data.banner_image || '/images/dashboard-banner.jpg'}')` }}
                            />
                            <div
                                className="absolute inset-0 z-0"
                                style={{ background: resolveBannerGradient(data.banner_color) }}
                            />
                            <div className="relative z-10 space-y-1">
                                <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-medium border border-white/20">
                                    Live Preview • [{data.code || 'GH-01'}] {data.city || 'Miami'}
                                </span>
                                <h4 className="text-base font-bold drop-shadow-sm">{data.name || 'Grand Horizon Hotel & Resort'}</h4>
                                <p className="text-xs text-blue-100/90 line-clamp-1">Live occupancy, daily revenue, front desk operations.</p>
                            </div>
                        </div>

                        {/* Color Gradient Selection */}
                        <div className="space-y-2 pt-1">
                            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                <Palette className="h-3.5 w-3.5 text-blue-600" />
                                Choose Banner Color & Gradient Theme
                            </Label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {BANNER_COLOR_PRESETS.map((preset) => {
                                    const isSelected = data.banner_color === preset.gradient;
                                    return (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => setData('banner_color', preset.gradient)}
                                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-all ${
                                                isSelected
                                                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 font-semibold'
                                                    : 'border-border hover:bg-muted/50 text-foreground'
                                            }`}
                                        >
                                            <span
                                                className="h-4 w-4 rounded-full shrink-0 border border-white/40 shadow-xs"
                                                style={{ backgroundColor: preset.hex }}
                                            />
                                            <span className="truncate">{preset.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Image Presets & Custom URL */}
                        <div className="space-y-2 pt-1">
                            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                                Choose Banner Image
                            </Label>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {BANNER_IMAGE_PRESETS.map((preset) => {
                                    const isSelected = data.banner_image === preset.url;
                                    return (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => setData('banner_image', preset.url)}
                                            className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                                                isSelected
                                                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 font-semibold'
                                                    : 'border-border hover:bg-muted/50 text-foreground'
                                            }`}
                                        >
                                            <div
                                                className="h-8 w-12 rounded bg-cover bg-center shrink-0 border"
                                                style={{ backgroundImage: `url('${preset.url}')` }}
                                            />
                                            <span className="truncate">{preset.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="pt-1.5">
                                <Label htmlFor="banner_image" className="text-xs text-muted-foreground">Or Enter Custom Image URL / Path</Label>
                                <Input
                                    id="banner_image"
                                    value={data.banner_image}
                                    onChange={(e) => setData('banner_image', e.target.value)}
                                    placeholder="/images/dashboard-banner.jpg or https://images.unsplash.com/..."
                                    className="mt-1"
                                />
                                <InputError message={errors.banner_image} />
                            </div>
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
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
                            {processing ? 'Saving...' : 'Save Hotel Settings'}
                        </Button>

                        {recentlySuccessful && (
                            <p className="text-sm text-green-600 font-medium">Saved successfully.</p>
                        )}
                    </div>
                </form>
            </div>
        </>
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
