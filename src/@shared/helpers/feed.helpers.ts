/** Returns a validation error message for a feed post, or null when valid. */
export function validateFeedPostContent(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed) {
    return "Write something before posting.";
  }
  if (trimmed.length > 500) {
    return "Posts must be 500 characters or fewer.";
  }
  return null;
}
