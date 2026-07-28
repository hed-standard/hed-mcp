import { hedSchemaResource, handleResourceRequest } from '../../src/resources/hedSchema';

describe('HED Schema Resource', () => {
  describe('Resource Definition', () => {
    test('should have correct resource URI', () => {
      expect(hedSchemaResource.uri).toBe('hed://schema/latest');
    });

    test('should have a name', () => {
      expect(hedSchemaResource.name).toBe('HED Schema');
    });

    test('should have a description', () => {
      expect(hedSchemaResource.description).toBeDefined();
      if (hedSchemaResource.description) {
        expect(hedSchemaResource.description.length).toBeGreaterThan(0);
      }
    });

    test('should have correct MIME type', () => {
      expect(hedSchemaResource.mimeType).toBe('application/json');
    });
  });

  describe('handleResourceRequest', () => {
    test('should return schema data for latest schema URI', async () => {
      const result = await handleResourceRequest('hed://schema/latest');

      expect(result).toBeDefined();
      expect(result.version).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.tags).toBeDefined();
      expect(Array.isArray(result.tags)).toBe(true);
    });

    test('should return expected schema structure', async () => {
      const result = await handleResourceRequest('hed://schema/latest');

      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('tags');
      
      expect(typeof result.version).toBe('string');
      expect(typeof result.description).toBe('string');
      expect(Array.isArray(result.tags)).toBe(true);
    });

    test('should include expected HED tag categories', async () => {
      const result = await handleResourceRequest('hed://schema/latest');

      expect(result.tags).toContain('Action');
      expect(result.tags).toContain('Agent');
      expect(result.tags).toContain('Event');
      expect(result.tags).toContain('Item');
      expect(result.tags).toContain('Property');
    });

    test('should have version in expected format', async () => {
      const result = await handleResourceRequest('hed://schema/latest');

      expect(result.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('should throw error for unknown resource URI', async () => {
      const unknownUri = 'hed://unknown/resource';

      await expect(handleResourceRequest(unknownUri))
        .rejects
        .toThrow(`Unknown resource: ${unknownUri}`);
    });

    test('should throw error for invalid URI format', async () => {
      const invalidUri = 'invalid-uri';

      await expect(handleResourceRequest(invalidUri))
        .rejects
        .toThrow(`Unknown resource: ${invalidUri}`);
    });

    test('should throw error for empty URI', async () => {
      await expect(handleResourceRequest(''))
        .rejects
        .toThrow('Unknown resource: ');
    });
  });

  describe('Schema Content Validation', () => {
    test('should return consistent data on multiple calls', async () => {
      const result1 = await handleResourceRequest('hed://schema/latest');
      const result2 = await handleResourceRequest('hed://schema/latest');

      expect(result1).toEqual(result2);
    });

    test('should return non-empty tag list', async () => {
      const result = await handleResourceRequest('hed://schema/latest');

      expect(result.tags.length).toBeGreaterThan(0);
    });

    test('should return valid JSON-serializable data', async () => {
      const result = await handleResourceRequest('hed://schema/latest');

      // Test that the result can be JSON serialized and deserialized
      const serialized = JSON.stringify(result);
      const deserialized = JSON.parse(serialized);

      expect(deserialized).toEqual(result);
    });
  });
});
