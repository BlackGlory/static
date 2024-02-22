export function normalizeSubset(subset: string): string {
  const chars = subset.split('')
  const uniquedChars = Array.from(new Set(chars))
  const sortedChars = uniquedChars.sort()
  const result = sortedChars.join('')
  return result
}
