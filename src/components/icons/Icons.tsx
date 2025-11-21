import React from 'react';

export const Dove: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M2 12c3-2 6-3 9-3s6 1 9 3c-1 3-4 6-9 6s-8-3-9-6z" fill="currentColor" />
  </svg>
);

export const Tasbeeh: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M7 7l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const Quran: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M7 8h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const Money: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M12 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

export const Star: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2l2.6 5.3L20 9l-4 3.9L17 20l-5-2.6L7 20l1-7.1L4 9l5.4-1.7L12 2z" fill="currentColor" />
  </svg>
);

const ICONS: { [key: string]: React.FC<{ className?: string }> } = {
  dove: Dove,
  tasbeeh: Tasbeeh,
  quran: Quran,
  money: Money,
  star: Star,
};

export default ICONS;