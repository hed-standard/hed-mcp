import { SchemaCache, schemaCache, normalizeVersion } from '../../src/utils/schemaCache';
import { buildSchemasFromVersion } from 'hed-validator';

// Mock the hed-validator module
jest.mock('hed-validator', () => ({
  buildSchemasFromVersion: jest.fn()
}));

const mockBuildSchemasFromVersion = buildSchemasFromVersion as jest.MockedFunction<typeof buildSchemasFromVersion>;

describe('normalizeVersion', () => {
  test('should handle simple version strings', () => {
    expect(normalizeVersion('8.4.0')).toBe('8.4.0');
    expect(normalizeVersion('8.3.0')).toBe('8.3.0');
  });

  test('should trim whitespace from single version', () => {
    expect(normalizeVersion('  8.4.0')).toBe('8.4.0');
    expect(normalizeVersion('8.4.0  ')).toBe('8.4.0');
    expect(normalizeVersion('  8.4.0  ')).toBe('8.4.0');
  });

  test('should normalize multi-library versions', () => {
    expect(normalizeVersion('8.4.0,ts:testlib_1.0.0')).toBe('8.4.0,ts:testlib_1.0.0');
    expect(normalizeVersion(' 8.4.0,   ts:testlib_1.0.0')).toBe('8.4.0,ts:testlib_1.0.0');
    expect(normalizeVersion('  8.4.0  ,  ts:testlib_1.0.0  ')).toBe('8.4.0,ts:testlib_1.0.0');
  });

  test('should handle complex multi-library versions', () => {
    expect(normalizeVersion('8.4.0, ts:testlib_1.0.0, lang:es_1.0.0')).toBe('8.4.0,ts:testlib_1.0.0,lang:es_1.0.0');
    expect(normalizeVersion('  8.4.0  ,   ts:testlib_1.0.0  ,  lang:es_1.0.0  ')).toBe('8.4.0,ts:testlib_1.0.0,lang:es_1.0.0');
  });

  test('should remove empty parts', () => {
    expect(normalizeVersion('8.4.0,,ts:testlib_1.0.0')).toBe('8.4.0,ts:testlib_1.0.0');
    expect(normalizeVersion('8.4.0, ,ts:testlib_1.0.0')).toBe('8.4.0,ts:testlib_1.0.0');
    expect(normalizeVersion('8.4.0,   ,   ts:testlib_1.0.0')).toBe('8.4.0,ts:testlib_1.0.0');
  });

  test('should handle edge cases', () => {
    expect(normalizeVersion('')).toBe('');
    expect(normalizeVersion('   ')).toBe('');
    expect(normalizeVersion(null as any)).toBe(null);
    expect(normalizeVersion(undefined as any)).toBe(undefined);
  });
});

describe('SchemaCache', () => {
  let cache: SchemaCache;

  beforeEach(() => {
    cache = new SchemaCache();
    mockBuildSchemasFromVersion.mockClear();
  });

  afterEach(() => {
    cache.clearCache();
  });

  describe('getOrCreateSchema', () => {
    test('should load and cache a new schema', async () => {
      const mockSchema = {} as any; // Mock schema object
      mockBuildSchemasFromVersion.mockResolvedValue(mockSchema);

      const result = await cache.getOrCreateSchema('8.4.0');

      expect(mockBuildSchemasFromVersion).toHaveBeenCalledWith('8.4.0');
      expect(mockBuildSchemasFromVersion).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockSchema);
      expect(cache.hasSchema('8.4.0')).toBe(true);
    });

    test('should normalize version strings before caching', async () => {
      const mockSchema = {} as any; // Mock schema object
      mockBuildSchemasFromVersion.mockResolvedValue(mockSchema);

      // Load with non-normalized version
      const result1 = await cache.getOrCreateSchema('  8.4.0  ');
      
      // Load with normalized version - should use cache
      const result2 = await cache.getOrCreateSchema('8.4.0');

      expect(mockBuildSchemasFromVersion).toHaveBeenCalledTimes(1);
      expect(mockBuildSchemasFromVersion).toHaveBeenCalledWith('  8.4.0  '); // Original passed to validator
      expect(result1).toBe(mockSchema);
      expect(result2).toBe(mockSchema);
      expect(result1).toBe(result2); // Same object reference
      expect(cache.hasSchema('8.4.0')).toBe(true);
      expect(cache.hasSchema('  8.4.0  ')).toBe(true); // Both forms work
    });

    test('should handle multi-library version normalization', async () => {
      const mockSchema = {} as any; // Mock schema object
      mockBuildSchemasFromVersion.mockResolvedValue(mockSchema);

      // Load with non-normalized multi-library version
      const result1 = await cache.getOrCreateSchema(' 8.4.0,   ts:testlib_1.0.0');
      
      // Load with differently formatted but equivalent version
      const result2 = await cache.getOrCreateSchema('8.4.0, ts:testlib_1.0.0  ');

      expect(mockBuildSchemasFromVersion).toHaveBeenCalledTimes(1);
      expect(result1).toBe(mockSchema);
      expect(result2).toBe(mockSchema);
      expect(result1).toBe(result2); // Same object reference
    });

    test('should return cached schema on subsequent calls', async () => {
      const mockSchema = {} as any; // Mock schema object
      mockBuildSchemasFromVersion.mockResolvedValue(mockSchema);

      // First call - should load and cache
      const result1 = await cache.getOrCreateSchema('8.4.0');
      
      // Second call - should use cache
      const result2 = await cache.getOrCreateSchema('8.4.0');

      expect(mockBuildSchemasFromVersion).toHaveBeenCalledTimes(1);
      expect(result1).toBe(mockSchema);
      expect(result2).toBe(mockSchema);
      expect(result1).toBe(result2); // Same object reference
    });

    test('should cache different schema versions separately', async () => {
      const mockSchema840 = {} as any; // Mock schema object for 8.4.0
      const mockSchema830 = {} as any; // Mock schema object for 8.3.0
      
      mockBuildSchemasFromVersion
        .mockResolvedValueOnce(mockSchema840)
        .mockResolvedValueOnce(mockSchema830);

      const result840 = await cache.getOrCreateSchema('8.4.0');
      const result830 = await cache.getOrCreateSchema('8.3.0');

      expect(mockBuildSchemasFromVersion).toHaveBeenCalledTimes(2);
      expect(mockBuildSchemasFromVersion).toHaveBeenCalledWith('8.4.0');
      expect(mockBuildSchemasFromVersion).toHaveBeenCalledWith('8.3.0');
      expect(result840).toBe(mockSchema840);
      expect(result830).toBe(mockSchema830);
      expect(cache.hasSchema('8.4.0')).toBe(true);
      expect(cache.hasSchema('8.3.0')).toBe(true);
    });

    test('should propagate errors from buildSchemasFromVersion', async () => {
      const error = new Error('Invalid schema version');
      mockBuildSchemasFromVersion.mockRejectedValue(error);

      await expect(cache.getOrCreateSchema('invalid')).rejects.toThrow('Invalid schema version');
      expect(mockBuildSchemasFromVersion).toHaveBeenCalledWith('invalid');
      expect(cache.hasSchema('invalid')).toBe(false);
    });
  });

  describe('hasSchema', () => {
    test('should return false for non-cached schema', () => {
      expect(cache.hasSchema('8.4.0')).toBe(false);
    });

    test('should return true for cached schema', async () => {
      const mockSchema = {} as any; // Mock schema object
      mockBuildSchemasFromVersion.mockResolvedValue(mockSchema);

      await cache.getOrCreateSchema('8.4.0');
      expect(cache.hasSchema('8.4.0')).toBe(true);
    });

    test('should work with normalized versions', async () => {
      const mockSchema = {} as any; // Mock schema object
      mockBuildSchemasFromVersion.mockResolvedValue(mockSchema);

      // Cache with non-normalized version
      await cache.getOrCreateSchema('  8.4.0  ');
      
      // Check with various formats
      expect(cache.hasSchema('8.4.0')).toBe(true);
      expect(cache.hasSchema('  8.4.0')).toBe(true);
      expect(cache.hasSchema('8.4.0  ')).toBe(true);
      expect(cache.hasSchema('  8.4.0  ')).toBe(true);
    });
  });

  describe('getCacheStats', () => {
    test('should return empty stats for new cache', () => {
      const stats = cache.getCacheStats();
      expect(stats.cachedVersions).toEqual([]);
      expect(stats.cacheSize).toBe(0);
    });

    test('should return accurate stats after caching schemas', async () => {
      const mockSchema840 = {} as any; // Mock schema object for 8.4.0
      const mockSchema830 = {} as any; // Mock schema object for 8.3.0
      
      mockBuildSchemasFromVersion
        .mockResolvedValueOnce(mockSchema840)
        .mockResolvedValueOnce(mockSchema830);

      await cache.getOrCreateSchema('8.4.0');
      await cache.getOrCreateSchema('8.3.0');

      const stats = cache.getCacheStats();
      expect(stats.cacheSize).toBe(2);
      expect(stats.cachedVersions).toContain('8.4.0');
      expect(stats.cachedVersions).toContain('8.3.0');
    });
  });

  describe('clearCache', () => {
    test('should clear all cached schemas', async () => {
      const mockSchema = {} as any; // Mock schema object
      mockBuildSchemasFromVersion.mockResolvedValue(mockSchema);

      await cache.getOrCreateSchema('8.4.0');
      expect(cache.hasSchema('8.4.0')).toBe(true);

      cache.clearCache();
      expect(cache.hasSchema('8.4.0')).toBe(false);
      expect(cache.getCacheStats().cacheSize).toBe(0);
    });
  });

  describe('removeSchema', () => {
    test('should remove specific schema version', async () => {
      const mockSchema840 = {} as any; // Mock schema object for 8.4.0
      const mockSchema830 = {} as any; // Mock schema object for 8.3.0
      
      mockBuildSchemasFromVersion
        .mockResolvedValueOnce(mockSchema840)
        .mockResolvedValueOnce(mockSchema830);

      await cache.getOrCreateSchema('8.4.0');
      await cache.getOrCreateSchema('8.3.0');

      const removed = cache.removeSchema('8.4.0');
      expect(removed).toBe(true);
      expect(cache.hasSchema('8.4.0')).toBe(false);
      expect(cache.hasSchema('8.3.0')).toBe(true);
    });

    test('should work with normalized versions', async () => {
      const mockSchema = {} as any; // Mock schema object
      mockBuildSchemasFromVersion.mockResolvedValue(mockSchema);

      // Cache with non-normalized version
      await cache.getOrCreateSchema('  8.4.0  ');
      expect(cache.hasSchema('8.4.0')).toBe(true);

      // Remove with different formatting
      const removed = cache.removeSchema('8.4.0  ');
      expect(removed).toBe(true);
      expect(cache.hasSchema('8.4.0')).toBe(false);
      expect(cache.hasSchema('  8.4.0  ')).toBe(false);
    });

    test('should return false when removing non-existent schema', () => {
      const removed = cache.removeSchema('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('singleton instance', () => {
    test('should export a singleton instance', () => {
      expect(schemaCache).toBeInstanceOf(SchemaCache);
    });
  });
});
