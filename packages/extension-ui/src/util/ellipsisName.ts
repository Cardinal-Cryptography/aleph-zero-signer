export const ellipsisName = (input: string | null | undefined): string | null => {
  if (!input || input.length < 8) {
    return null;
  }
  
  const firstHalf = input.slice(0, 4);
  const secondHalf = input.slice(-4);
  
  return firstHalf + '...' + secondHalf;
};
