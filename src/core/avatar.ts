export type CompanionId = 'lumi' | 'momo' | 'nova';
export const companionNames = { lumi: '시이카와', momo: '시이카로', nova: '시이쿠마' };
export const companionImages: Record<
  CompanionId,
  {
    path: string;
    faceViewBox: string;
    outfitTransform: string;
    faceAccessoryTransform: string;
    neckAccessoryTransform: string;
  }
> = {
  lumi: {
    path: 'avatars/siikawa-avatar.png',
    faceViewBox: '24 6 192 192',
    outfitTransform: 'translate(-18 75) scale(1.15 .65)',
    faceAccessoryTransform: 'translate(-45 -6.5) scale(1.38 .87)',
    neckAccessoryTransform: 'translate(-12 35.8) scale(1.1 .8)',
  },
  momo: {
    path: 'avatars/siikaro-avatar.png',
    faceViewBox: '24 1 192 192',
    outfitTransform: 'translate(-12 42) scale(1.1 .82)',
    faceAccessoryTransform: 'translate(-20.4 -10) scale(1.17 .86)',
    neckAccessoryTransform: 'translate(-12 4) scale(1.1 .9)',
  },
  nova: {
    path: 'avatars/siikuma-avatar.png',
    faceViewBox: '23 8 194 194',
    outfitTransform: 'translate(0 35) scale(1 .8)',
    faceAccessoryTransform: 'translate(-36 -6) scale(1.3 .9)',
    neckAccessoryTransform: 'translate(0 -.5) scale(1 .9)',
  },
};
export function resolveAvatar(id?: string): CompanionId {
  return id === 'momo' || id === 'nova' ? id : 'lumi';
}
