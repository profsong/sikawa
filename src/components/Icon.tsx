export type IconName =
  | 'home'
  | 'map'
  | 'leaf'
  | 'chart'
  | 'settings'
  | 'arrow'
  | 'check'
  | 'sound'
  | 'book'
  | 'spark'
  | 'clock'
  | 'shield'
  | 'close'
  | 'trophy'
  | 'star'
  | 'gem'
  | 'heart'
  | 'lock'
  | 'flag'
  | 'headphones'
  | 'moon';
const paths: Record<IconName, string> = {
  home: 'm3 10 7-6a3 3 0 0 1 4 0l7 6M5 9v10a2 2 0 0 0 2 2h3v-6h4v6h3a2 2 0 0 0 2-2V9',
  map: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Zm6-3v15m6-12v15',
  leaf: 'M20 3c-9-1-17 4-16 11 1 7 13 8 16-11ZM4 21 15 10',
  chart:
    'M4 20V11a1 1 0 0 1 1-1h2v10m3 0V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v15m3 0v-6h2a1 1 0 0 1 1 1v5M3 21h18',
  settings:
    'm9 3-1 3-3 1-2 4 2 2v4l4 3 3-1 3 1 4-3v-4l2-2-2-4-3-1-1-3Zm7 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  check: 'm5 12 4 4L19 6',
  sound: 'M3 9h4l5-4v14l-5-4H3Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
  book: 'M12 5C8 2 4 3 2 4v15c3-1 6-1 10 2m0-16c4-3 8-2 10-1v15c-3-1-6-1-10 2Zm0 0v16',
  spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
  clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M12 6v6l4 2',
  shield: 'm12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Zm-4 10 3 3 5-6',
  close: 'm6 6 12 12M6 18 18 6',
  trophy:
    'M7 3h10v6a5 5 0 0 1-10 0ZM7 5H3v2a5 5 0 0 0 5 5m9-7h4v2a5 5 0 0 1-5 5m-4 2v4m-5 3h10m-8-3h6l1 3H8Z',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',
  gem: 'm7 4-4 6 9 11 9-11-4-6ZM3 10h18M7 4l5 17 5-17',
  heart: 'M12 21s-9-5.4-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.6-9 12-9 12Z',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Zm6 5v2',
  flag: 'M5 22V3m0 1q4-3 8 0t7 0v10q-3 3-7 0t-8 0',
  headphones:
    'M3 14v-2a9 9 0 0 1 18 0v2M5 12H3v7h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2Zm14 0h2v7h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm2 7q-1 3-6 3',
  moon: 'M20 15a9 9 0 1 1-11-12 8 8 0 0 0 11 12Z',
};
export function Icon({
  name,
  size = 22,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}
