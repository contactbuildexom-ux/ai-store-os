'use client';

import React from 'react';

export type SocialLinks = Partial<Record<'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'x', string>>;

interface SocialConfig {
  key: keyof SocialLinks;
  label: string;
  color: string;
  bgColor: string;
  hoverColor: string;
  svg: (className?: string) => React.ReactNode;
}

const SOCIAL_CONFIGS: SocialConfig[] = [
  {
    key: 'instagram',
    label: 'Instagram',
    color: '#e1306c',
    bgColor: 'hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600',
    hoverColor: 'hover:text-[#e1306c]',
    svg: (cls = 'size-4') => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    color: '#1877f2',
    bgColor: 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600',
    hoverColor: 'hover:text-[#1877f2]',
    svg: (cls = 'size-4') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    color: '#000000',
    bgColor: 'hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900',
    hoverColor: 'hover:text-black',
    svg: (cls = 'size-4') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.43c-.02 2.1-.84 4.13-2.33 5.61-1.49 1.49-3.52 2.31-5.63 2.3-2.09-.01-4.11-.83-5.59-2.31-1.48-1.48-2.3-3.51-2.29-5.6.01-2.09.83-4.12 2.31-5.6 1.48-1.48 3.51-2.3 5.6-2.29.62.01 1.23.09 1.83.25v4.11c-.5-.22-1.06-.33-1.62-.32-1.08.01-2.12.44-2.88 1.2-.76.76-1.19 1.8-1.18 2.88.01 1.08.44 2.12 1.2 2.88.76.76 1.8 1.19 2.88 1.18 1.08-.01 2.12-.44 2.88-1.2.76-.76 1.19-1.8 1.18-2.88V0l.3-.02h-1.01z" />
      </svg>
    ),
  },
  {
    key: 'youtube',
    label: 'YouTube',
    color: '#ff0000',
    bgColor: 'hover:bg-red-50 hover:border-red-300 hover:text-red-600',
    hoverColor: 'hover:text-[#ff0000]',
    svg: (cls = 'size-4') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    key: 'x',
    label: 'X (Twitter)',
    color: '#000000',
    bgColor: 'hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900',
    hoverColor: 'hover:text-black',
    svg: (cls = 'size-4') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export function StoreSocialLinks({ links }: { links?: SocialLinks | null }) {
  const configured = SOCIAL_CONFIGS.filter(
    ({ key }) => typeof links?.[key] === 'string' && links[key]?.trim()
  );

  if (configured.length === 0) return null;

  return (
    <nav aria-label="Store official social media links" className="flex items-center justify-center gap-2.5 py-1">
      {configured.map(({ key, label, bgColor, svg }) => (
        <a
          key={key}
          href={links?.[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Follow our official ${label} page`}
          title={label}
          className={`grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${bgColor} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
        >
          {svg()}
        </a>
      ))}
    </nav>
  );
}
