import { validateHedString } from '../src/tools/validateHedString';
import { hedSchemaResource } from '../src/resources/hedSchema';
import { HedValidationResult, FormattedIssue } from '../src/types/index';

describe('Project Integration', () => {
  describe('Module Imports', () => {
    test('should successfully import all main modules', () => {
      expect(validateHedString).toBeDefined();
      expect(hedSchemaResource).toBeDefined();
    });

    test('should have tool with expected structure', () => {
      expect(validateHedString).toHaveProperty('name');
      expect(validateHedString).toHaveProperty('description');
      expect(validateHedString).toHaveProperty('inputSchema');
    });

    test('should have resource with expected structure', () => {
      expect(hedSchemaResource).toHaveProperty('uri');
      expect(hedSchemaResource).toHaveProperty('name');
      expect(hedSchemaResource).toHaveProperty('description');
      expect(hedSchemaResource).toHaveProperty('mimeType');
    });
  });

  describe('Type System', () => {
    test('should create valid HedValidationResult objects', () => {
      const successResult: HedValidationResult = {
        isValid: true,
      };

      const testError: FormattedIssue = {
        code: 'TEST_ERROR',
        detailedCode: 'TEST_ERROR_DETAILED',
        severity: 'error',
        message: 'This is a test error.',
        column: '1',
        line: '1',
        location: 'Line 1, Column 1',
      };

      const testWarning: FormattedIssue = {
        code: 'TEST_WARNING',
        detailedCode: 'TEST_WARNING_DETAILED',
        severity: 'warning',
        message: 'This is a test warning.',
        column: '10',
        line: '2',
        location: 'Line 2, Column 10',
      };

      const errorResult: HedValidationResult = {
        isValid: false,
        errors: [testError],
        warnings: [testWarning],
      };

      expect(successResult.isValid).toBe(true);
      expect(errorResult.isValid).toBe(false);
      expect(errorResult.errors).toContain(testError);
      expect(errorResult.warnings).toContain(testWarning);
    });
  });

  describe('Project Structure Consistency', () => {
    test('should have consistent naming conventions', () => {
      // Tool names should be camelCase
      expect(validateHedString.name).toMatch(/^[a-z][a-zA-Z0-9]*$/);

      // Resource URIs should follow expected pattern
      expect(hedSchemaResource.uri).toMatch(/^[a-z]+:\/\//);
    });

    test('should have proper schema definitions', () => {
      // Tool should have proper input schema
      expect(validateHedString.inputSchema).toHaveProperty('type');
      expect(validateHedString.inputSchema).toHaveProperty('properties');

      // Resource should have proper MIME type
      expect(hedSchemaResource.mimeType).toMatch(/^[a-z]+\/[a-z-]+\+?[a-z]+$/);
    });
  });

  describe('Configuration Validation', () => {
    test('should have tools that can be serialized', () => {
      const serialized = JSON.stringify(validateHedString);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.name).toBe(validateHedString.name);
      expect(deserialized.description).toBe(validateHedString.description);
    });

    test('should have resources that can be serialized', () => {
      const serialized = JSON.stringify(hedSchemaResource);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.uri).toBe(hedSchemaResource.uri);
      expect(deserialized.name).toBe(hedSchemaResource.name);
    });
  });
});
