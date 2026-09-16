import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {/* Solid Shield Background */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" />
            {/* Inner Leaves/Sprout in white/transparent */}
            <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M12 16v-6" />
                <path d="M12 12c-2-1-3-3-3-3" />
                <path d="M12 12c2-1 3-3 3-3" />
                <path d="M12 14c-1.5-1-2.5-1-2.5-1" />
                <path d="M12 14c1.5-1 2.5-1 2.5-1" />
            </g>
        </svg>
    );
}
