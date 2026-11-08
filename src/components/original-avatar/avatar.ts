/** Rendering-only IDs for the unchanged avatar artwork copied from the original app. */
export type CompanionId = 'monchichi' | 'sichiware' | 'sipompurin';

export function resolveAvatar(id?: CompanionId | 'lumi' | 'momo' | 'nova'): CompanionId {
  if (id === 'momo' || id === 'sichiware') return 'sichiware';
  if (id === 'nova' || id === 'sipompurin') return 'sipompurin';
  return 'monchichi';
}
