export const ALL_FILTER = 'all';

export function matchesFilter(filter: string, collectionId: string): boolean {
  return filter === ALL_FILTER || filter === collectionId;
}
