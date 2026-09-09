import type { ItemType } from '@/types';

export const itemTypeLabels: Record<ItemType, string> = {
  BookPhysical: 'Physical Book',
  StoryPhysical: 'Physical Story',
  BookOnline: 'Online Book',
  StoryOnline: 'Online Story',
};

export const itemTypeShort: Record<ItemType, string> = {
  BookPhysical: 'Book',
  StoryPhysical: 'Story',
  BookOnline: 'eBook',
  StoryOnline: 'eStory',
};

export function isPhysical(type: ItemType): boolean {
  return type === 'BookPhysical' || type === 'StoryPhysical';
}

export function isOnline(type: ItemType): boolean {
  return type === 'BookOnline' || type === 'StoryOnline';
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
