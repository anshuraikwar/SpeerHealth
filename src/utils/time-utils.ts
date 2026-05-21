export const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();

  const diffMinutes = Math.floor(
    diffMs / (1000 * 60)
  );

  const diffHours = Math.floor(
    diffMinutes / 60
  );

  const diffDays = Math.floor(
    diffHours / 24
  );

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  return `${diffDays}d ago`;
};