/**
 * Application configuration settings
 * Centralized configuration for environment-specific values
 */

// Dynamically determine the API base URL based on the current hostname
function getBaseUrl(): string {
  const hostname = window.location.hostname;
  
  // If running on localhost, use localhost for the API
  if (hostname === 'localhost') {
    return 'http://localhost:3030';
  }
  
  // If running on a specific IP address, use that IP for the API
  return `http://${hostname}:3030`;
}

export const AppConfig = {
  apiBaseUrl: getBaseUrl(),
  
  // Authentication settings
  auth: {
    tokenKey: 'auth_token',
    userKey: 'current_user',
  },
  
  // File upload settings
  uploads: {
    defaultProfileImage: 'assets/default-avatar.png',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
  },
  
  // Pagination settings
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 50,
  }
};

/**
 * Helper function to get API endpoint URLs
 * @param path - The API endpoint path
 * @returns The full API URL
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${AppConfig.apiBaseUrl}/${cleanPath}`;
}

/**
 * Helper function to get profile image URL
 * @param profilePicturePath - The profile picture path from the API
 * @returns The full profile image URL or default image
 */
export function getProfileImageUrl(profilePicturePath: string | null | undefined): string {
  if (!profilePicturePath) {
    return AppConfig.uploads.defaultProfileImage;
  }
  return `${AppConfig.apiBaseUrl}${profilePicturePath}`;
}
