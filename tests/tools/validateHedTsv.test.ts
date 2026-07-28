import { handleValidateHedTsv, ValidateHedTsvArgs, validateHedTsv } from '../../src/tools/validateHedTsv';
import { buildSchemasFromVersion } from 'hed-validator';
import * as path from 'path';
import { check } from 'zod/v4';

describe('validateHedTsvTool', () => {
  describe('Tool Definition', () => {
    test('should have correct tool name', () => {
      expect(validateHedTsv.name).toBe('validateHedTsv');
    });

    test('should have a description', () => {
      expect(validateHedTsv.description).toBeDefined();
      if (validateHedTsv.description) {
        expect(validateHedTsv.description.length).toBeGreaterThan(0);
      }
    });

    test('should have input schema with required filePath', () => {
      expect(validateHedTsv.inputSchema).toBeDefined();
      expect(validateHedTsv.inputSchema.properties).toBeDefined();
      if (validateHedTsv.inputSchema.properties) {
        expect(validateHedTsv.inputSchema.properties.filePath).toBeDefined();
      }
      expect(validateHedTsv.inputSchema.required).toContain('filePath');
    });

    test('should have required hedVersion parameter', () => {
      if (validateHedTsv.inputSchema.properties) {
        expect(validateHedTsv.inputSchema.properties.hedVersion).toBeDefined();
      }
      expect(validateHedTsv.inputSchema.required).toContain('hedVersion');
    });

    test('should have optional checkForWarnings parameter', () => {
      if (validateHedTsv.inputSchema.properties) {
        expect(validateHedTsv.inputSchema.properties.checkForWarnings).toBeDefined();
      }
      expect(validateHedTsv.inputSchema.required).not.toContain('checkForWarnings');
    });

    test('should have optional fileData parameter', () => {
      if (validateHedTsv.inputSchema.properties) {
        expect(validateHedTsv.inputSchema.properties.fileData).toBeDefined();
      }
      expect(validateHedTsv.inputSchema.required).not.toContain('fileData');
    });

    test('should have optional jsonData parameter', () => {
      if (validateHedTsv.inputSchema.properties) {
        expect(validateHedTsv.inputSchema.properties.jsonData).toBeDefined();
      }
      expect(validateHedTsv.inputSchema.required).not.toContain('jsonData');
    });

    test('should have optional definitions parameter', () => {
      if (validateHedTsv.inputSchema.properties) {
        expect(validateHedTsv.inputSchema.properties.definitions).toBeDefined();
      }
      expect(validateHedTsv.inputSchema.required).not.toContain('definitions');
    });
  });

  describe('handleValidateHedTsv', () => {
    const testDataDir = path.join(__dirname, '..', 'data');
    
    test('should return error when file cannot be read', async () => {
      const args: ValidateHedTsvArgs = {
        filePath: '/nonexistent/file.tsv',
        hedVersion: '8.4.0'
      };

      const result = await handleValidateHedTsv(args);
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INTERNAL_ERROR');
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toEqual([]);
    });

    test('should handle file data provided directly', async () => {
      const args: ValidateHedTsvArgs = {
        filePath: '/dummy/path.tsv',
        hedVersion: '8.4.0',
        fileData: 'sample\thed\nvalue\t(Red, Blue)'
      };

      const result = await handleValidateHedTsv(args);
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.errors).toEqual([]);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toEqual([]);
    });

    test('should handle jsonData parameter', async () => {
      const args: ValidateHedTsvArgs = {
        filePath: '/dummy/path.tsv',
        hedVersion: '8.4.0',
        checkForWarnings: true,
        fileData: 'key\tHED\nvalue\t(Red, Blue)',
        jsonData: '{"key": {"HED": "Label/#, Red/Blech"}}'
      };

      const result = await handleValidateHedTsv(args);
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.errors).toEqual([]);
      expect(result.warnings).toBeDefined();
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('should handle definitions parameter', async () => {
      const args: ValidateHedTsvArgs = {
        filePath: '/dummy/path.tsv',
        hedVersion: '8.4.0',
        fileData: 'sample\tHED\nvalue\t(Def/TestDef, Blue)',
        definitions: ['(Definition/TestDef, (Action/Move))', '(Definition/AnotherDef, (Sensory-event))']
      };

      const result = await handleValidateHedTsv(args);
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.errors).toEqual([]);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toEqual([]);
    });

    test('should handle checkForWarnings parameter', async () => {
      const args: ValidateHedTsvArgs = {
        filePath: '/dummy/path.tsv',
        hedVersion: '8.4.0',
        fileData: 'sample\tHED\nvalue\t(Red/Blech, Blue)',
        checkForWarnings: true
      };

      const result = await handleValidateHedTsv(args);

      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.errors).toEqual([]);
      expect(result.warnings).toBeDefined();
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('should handle validation errors gracefully', async () => {
      // This test simulates an internal error during validation
      const args: ValidateHedTsvArgs = {
        filePath: '/dummy/path.tsv',
        hedVersion: 'invalid-version', // This might cause an error
        fileData: 'sample\tHED\nvalue\t(Red, Blue)'
      };

      const result = await handleValidateHedTsv(args);
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toEqual([]);
    });
  });

  describe('Parameter Validation', () => {
    test('should validate required filePath parameter', () => {
      const schema = validateHedTsv.inputSchema;
      expect(schema.required).toContain('filePath');
    });

    test('should validate required hedVersion parameter', () => {
      const schema = validateHedTsv.inputSchema;
      expect(schema.required).toContain('hedVersion');
    });

    test('should have correct optional parameters', () => {
      const schema = validateHedTsv.inputSchema;
      const optionalParams = ['checkForWarnings', 'fileData', 'jsonData', 'definitions'];
      
      optionalParams.forEach(param => {
        expect(schema.required).not.toContain(param);
        if (schema.properties) {
          expect(schema.properties[param]).toBeDefined();
        }
      });
    });
  });
});
