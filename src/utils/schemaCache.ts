import { buildSchemasFromVersion } from 'hed-validator';

/**
 * Normalize a HED schema version string by trimming whitespace and normalizing separators
 * @param hedVersion - The raw HED schema version string
 * @returns The normalized version string
 */
function normalizeVersion(hedVersion: string): string {
  if (!hedVersion || typeof hedVersion !== 'string') {
    return hedVersion;
  }

  // Split by comma, trim each part, and rejoin
  return hedVersion
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0) // Remove empty parts
    .join(',');
}

/**
 * Schema cache for HED schemas
 * Maintains a Map of version -> Schema objects to avoid repeated loading
 */
export class SchemaCache {
  private cache: Map<string, any> = new Map();

  /**
   * Get a schema from cache or create it if not exists
   * @param hedVersion - The HED schema version to retrieve
   * @returns Promise resolving to the HED schema object
   */
  async getOrCreateSchema(hedVersion: string): Promise<any> {
    // Normalize the version string
    const normalizedVersion = normalizeVersion(hedVersion);
    
    // Check if schema is already cached
    if (this.cache.has(normalizedVersion)) {
      return this.cache.get(normalizedVersion);
    }
    
    try {
      // Load the schema using hed-validator with the original version string
      // (in case the validator expects specific formatting)
      const hedSchemas = await buildSchemasFromVersion(hedVersion);
      
      // Cache the schema using the normalized version as the key
      this.cache.set(normalizedVersion, hedSchemas);
      
      return hedSchemas;
    } catch (error) {
      console.error('Failed to load HED schema for version', normalizedVersion, error);
      throw error;
    }
  }

  /**
   * Check if a schema version is cached
   * @param hedVersion - The HED schema version to check
   * @returns boolean indicating if the schema is cached
   */
  hasSchema(hedVersion: string): boolean {
    const normalizedVersion = normalizeVersion(hedVersion);
    return this.cache.has(normalizedVersion);
  }

  /**
   * Get cache statistics
   * @returns Object with cache statistics
   */
  getCacheStats(): { cachedVersions: string[], cacheSize: number } {
    return {
      cachedVersions: Array.from(this.cache.keys()),
      cacheSize: this.cache.size
    };
  }

  /**
   * Clear the entire cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Remove a specific schema version from cache
   * @param hedVersion - The HED schema version to remove
   * @returns boolean indicating if the version was removed
   */
  removeSchema(hedVersion: string): boolean {
    const normalizedVersion = normalizeVersion(hedVersion);
    return this.cache.delete(normalizedVersion);
  }
}

// Export a singleton instance for use across the application
export const schemaCache = new SchemaCache();

// Export the normalize function for testing and external use
export { normalizeVersion };
