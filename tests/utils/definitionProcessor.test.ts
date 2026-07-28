import { 
  convertDefinitions, 
  createDefinitionManager,
  ConvertDefinitionsResult
} from '../../src/utils/definitionProcessor';
import { DefinitionManager, buildSchemasFromVersion, Schemas } from 'hed-validator';
import { FormattedIssue, DefinitionResult } from '../../src/types/index';

describe('Definition Processor', () => {
  let hedSchemas: Schemas;

  beforeAll(async () => {
    // Get real HED schemas for testing
    hedSchemas = await buildSchemasFromVersion('8.4.0');
  });

  describe('convertDefinitions', () => {
    test('should successfully convert valid definitions', () => {
      const definitionStrings = [
        '(Definition/MyDef, (Red))',
        '(Definition/AnotherDef, (Blue))'
      ];

      const result = convertDefinitions(definitionStrings, hedSchemas);

      expect(result.definitions).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      
      // Check that definitions were actually created
      expect(result.definitions[0].name).toBe('MyDef');
      expect(result.definitions[1].name).toBe('AnotherDef');
    });

    test('should handle invalid definition strings', () => {
      const definitionStrings = [
        '(Definition/BadDef, Red)', // Invalid: missing parentheses around Red
        '(Definition/GoodDef, (Blue))' // Valid
      ];

      const result = convertDefinitions(definitionStrings, hedSchemas);

      expect(result.definitions).toHaveLength(1); // Only good definition converted
      expect(result.errors.length).toBeGreaterThan(0); // Should have error issues
      expect(result.definitions[0].name).toBe('GoodDef');
    });

    test('should handle empty definition strings array', () => {
      const result = convertDefinitions([], hedSchemas);

      expect(result.definitions).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    test('should handle malformed definition strings', () => {
      const definitionStrings = [
        'Not a definition at all',
        '(Definition/ValidDef, (Green))'
      ];

      const result = convertDefinitions(definitionStrings, hedSchemas);

      expect(result.definitions).toHaveLength(1); // Only valid definition converted
      expect(result.errors.length).toBeGreaterThan(0); // Should have error issues
      expect(result.definitions[0].name).toBe('ValidDef');
    });

    test('should handle definitions with good placeholders', () => {
      const definitionStrings = ['(Definition/PlaceDef1/#, (Red, Label/#))', '(Definition/PlaceDef2/#, (Green, Label/#))'];

      const result = convertDefinitions(definitionStrings, hedSchemas);

      expect(result.definitions).toHaveLength(2); // Both placeholder definitions should be converted
      expect(result.errors).toHaveLength(0);
      expect(result.definitions[0].name).toBe('PlaceDef1');
      expect(result.definitions[1].name).toBe('PlaceDef2');
    });
  });

  describe('createDefinitionManager', () => {
    test('should create a new manager and process valid definitions', () => {
      const definitionStrings = ['(Definition/TestDef, (Yellow))'];

      const result = createDefinitionManager(definitionStrings, hedSchemas);

      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.definitionManager).toBeInstanceOf(DefinitionManager);
      expect(result.definitionManager).not.toBeNull();
      expect(result.definitionManager!.definitions.has('testdef')).toBe(true);
    });

    test('should handle invalid definitions', () => {
      const definitionStrings = ['(Definition/BadDef, Red)']; // Invalid

      const result = createDefinitionManager(definitionStrings, hedSchemas);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.definitionManager).toBeInstanceOf(DefinitionManager);
      expect(result.definitionManager).not.toBeNull();
      expect(result.definitionManager!.definitions.size).toBe(0);
    });

    test('should handle conflicting definitions', () => {
      const definitionStrings = ['(Definition/ValidDef, (Green))', '(Definition/ValidDef, (Red))'];

      const result = createDefinitionManager(definitionStrings, hedSchemas);

      expect(result.errors.length).toBeGreaterThan(0); // Should have error issues from DefinitionManager
      // The DefinitionManager should have the first definition (conflict behavior)
      expect(result.definitionManager).not.toBeNull();
      expect(result.definitionManager!.definitions.size).toBe(1);
      expect(result.definitionManager!.definitions.has('validdef')).toBe(true);
    });

    test('should handle empty definition strings array', () => {
      const result = createDefinitionManager([], hedSchemas);

      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.definitionManager).toBeNull();
    });

    test('should return null definitionManager for null input', () => {
      const result = createDefinitionManager(null as any, hedSchemas);

      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.definitionManager).toBeNull();
    });

    test('should return null definitionManager for undefined input', () => {
      const result = createDefinitionManager(undefined as any, hedSchemas);

      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.definitionManager).toBeNull();
    });
  });
});