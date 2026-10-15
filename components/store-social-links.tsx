'use client';

import { AtSign, Camera, Music2, Play, Users } from 'lucide-react';

type SocialLinks = Partial<Record<'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'x', string>>;

const SOCIALS = [
  { key: 'instagram', label: 'Instagram', Icon: Camera },
  { key: 'facebook', label: 'Facebook', Icon: Users },
  { key: 'youtube', label: 'YouTube', Icon: Play },
  { key: 'tiktok', label: 'TikTok', Icon: Music2 },
  { key: 'x', label: 'X', Icon: AtSign },
] as const;

export function StoreSocialLinks({ links }: { links?: SocialLinks | null }) {
  const configured = SOCIALS.filter(({ key }) => typeof links?.[key] === 'string' && links[key]?.trim());
  if (configured.length === 0) return null;

  return (
    <nav aria-label="Store social media" className="flex items-center justify-center gap-2">
      {configured.map(({ key, label, Icon }) => (
        <a
          key={key}
          href={links?.[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit our ${label} page`}
          title={label}
          className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Icon size={17} aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}
