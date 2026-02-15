/**
 * Utility functions for handling product images with fallback support and retry logic
 */

const PLACEHOLDER_IMAGE = '/assets/generated/product-placeholder.dim_200x200.png';
const MAX_RETRY_ATTEMPTS = 2;

// Track retry attempts per image URL
const retryAttempts = new Map<string, number>();

/**
 * Gets the product image URL with fallback to placeholder
 * @param imageUrl - The image URL from the backend
 * @returns The image URL to use, or placeholder if invalid
 */
export function getProductImageUrl(imageUrl: string | undefined | null): string {
  // Return placeholder if imageUrl is null, undefined, or empty string
  if (!imageUrl || imageUrl.trim() === '') {
    return PLACEHOLDER_IMAGE;
  }
  
  // Check if the URL is already the placeholder
  if (imageUrl.includes('product-placeholder')) {
    return PLACEHOLDER_IMAGE;
  }
  
  // Return the authentic image URL from backend
  return imageUrl;
}

/**
 * Handles image load errors with retry logic and fallback to placeholder
 * @param event - The error event from the img element
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>): void {
  const target = event.currentTarget;
  const originalSrc = target.getAttribute('data-original-src') || target.src;
  
  // Prevent infinite loop - if already showing placeholder, do nothing
  if (target.src.includes('product-placeholder')) {
    return;
  }
  
  // Get current retry count for this URL
  const currentRetries = retryAttempts.get(originalSrc) || 0;
  
  // If we haven't exceeded max retries, try again
  if (currentRetries < MAX_RETRY_ATTEMPTS) {
    retryAttempts.set(originalSrc, currentRetries + 1);
    
    // Add a small delay before retry to avoid immediate re-failure
    setTimeout(() => {
      // Force reload by adding cache-busting parameter
      const separator = originalSrc.includes('?') ? '&' : '?';
      target.src = `${originalSrc}${separator}_retry=${currentRetries + 1}&t=${Date.now()}`;
    }, 500 * (currentRetries + 1)); // Exponential backoff: 500ms, 1000ms
  } else {
    // Max retries exceeded, use placeholder
    target.src = PLACEHOLDER_IMAGE;
    target.alt = `${target.alt} (afbeelding niet beschikbaar)`;
    retryAttempts.delete(originalSrc); // Clean up retry tracking
  }
}

/**
 * Gets image props for consistent image handling across components
 * @param imageUrl - The image URL from the backend
 * @param alt - Alt text for the image
 * @returns Props object with src, alt, data-original-src, and onError handler
 */
export function getImageProps(imageUrl: string | undefined | null, alt: string) {
  const src = getProductImageUrl(imageUrl);
  
  return {
    src,
    alt,
    'data-original-src': imageUrl || PLACEHOLDER_IMAGE,
    onError: handleImageError,
  };
}

/**
 * Preloads an image to check if it's available
 * @param imageUrl - The image URL to preload
 * @returns Promise that resolves to true if image loads, false otherwise
 */
export function preloadImage(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!imageUrl || imageUrl.trim() === '' || imageUrl.includes('product-placeholder')) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
}

/**
 * Clears retry attempts for a specific URL (useful for cleanup)
 * @param imageUrl - The image URL to clear retry tracking for
 */
export function clearRetryAttempts(imageUrl: string): void {
  retryAttempts.delete(imageUrl);
}

/**
 * Clears all retry attempts (useful for component unmount)
 */
export function clearAllRetryAttempts(): void {
  retryAttempts.clear();
}
