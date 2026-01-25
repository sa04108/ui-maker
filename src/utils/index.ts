/**
 * Generate a unique ID with a prefix
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Remove file extension from filename
 */
export function removeExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}
