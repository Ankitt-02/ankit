/**
 * Helper to check if an error is a Next.js redirect exception (which should be re-thrown)
 */
export function isRedirectError(error: any): boolean {
  if (typeof error === 'object' && error !== null) {
    if (error.digest && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      return true;
    }
  }
  return false;
}

/**
 * Surface actionable error message for UI consumption
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && error.message) return String(error.message);
  return 'An error occurred during database operation';
}
