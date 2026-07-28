import { handleValidateHedString, ValidateHedStringArgs, validateHedString } from '../../src/tools/validateHedString';
import { buildSchemasFromVersion, DefinitionManager } from 'hed-validator';
describe('validateHedStringTool', () => {

  describe('Tool Definition', () => {
    test('should have correct tool name', () => {
      expect(validateHedString.name).toBe('validateHedString');
    });

    test('should have a description', () => {
      expect(validateHedString.description).toBeDefined();
      if (validateHedString.description) {
        expect(validateHedString.description.length).toBeGreaterThan(0);
      }
    });

    test('should have input schema with required hedString', () => {
      expect(validateHedString.inputSchema).toBeDefined();
      expect(validateHedString.inputSchema.properties).toBeDefined();
      if (validateHedString.inputSchema.properties) {
        expect(validateHedString.inputSchema.properties.hedString).toBeDefined();
      }
      expect(validateHedString.inputSchema.required).toContain('hedString');
    });

    test('should have required hedVersion parameter', () => {
      if (validateHedString.inputSchema.properties) {
        expect(validateHedString.inputSchema.properties.hedVersion).toBeDefined();
      }
      expect(validateHedString.inputSchema.required).toContain('hedVersion');
    });

    test('should have optional definitions parameter', () => {
      if (validateHedString.inputSchema.properties) {
        expect(validateHedString.inputSchema.properties.definitions).toBeDefined();
      }
      expect(validateHedString.inputSchema.required).not.toContain('definitions');
    });

    test('should have optional checkForWarnings parameter', () => {
        if (validateHedString.inputSchema.properties) {
            expect(validateHedString.inputSchema.properties.checkForWarnings).toBeDefined();
        }
        expect(validateHedString.inputSchema.required).not.toContain('checkForWarnings');
    });
  });

  describe('handleValidateHedString', () => {
    test('should return invalid for an empty HED string', async () => {
      const args: ValidateHedStringArgs = {
        hedString: '',
        hedVersion: '8.4.0',
        checkForWarnings: false
      };
      const result = await handleValidateHedString(args);
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.errors).toEqual([]);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toEqual([]);
    });

    test('should return valid for a simple HED string', async () => {
      const args: ValidateHedStringArgs = {
        hedString: 'Event/Sensory-event',
        hedVersion: '8.4.0',
        checkForWarnings: false
      };
      const result = await handleValidateHedString(args);
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.errors).toEqual([]);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toEqual([]);
    });

    test('should return an error for an invalid HED string', async () => {
        const args: ValidateHedStringArgs = {
          hedString: 'InvalidTag',
          hedVersion: '8.4.0',
          checkForWarnings: false
        };
        const result = await handleValidateHedString(args);
        expect(result).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('TAG_INVALID');
        expect(result.warnings).toBeDefined();
        expect(result.warnings).toEqual([]);
    });

    test('should not return warnings when checkForWarnings is false', async () => {
        const args: ValidateHedStringArgs = {
          hedString: 'Event,Item/MyObject', // Train requires Train-car
          hedVersion: '8.4.0',
          checkForWarnings: false,
        };
        const result = await handleValidateHedString(args);
        expect(result).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors).toEqual([]);
        expect(result.warnings).toBeDefined();
        expect(result.warnings).toEqual([]);
    });

    test('should return warnings when checkForWarnings is true', async () => {
        const args: ValidateHedStringArgs = {
          hedString: 'Event,Item/MyObject', // Train requires Train-car
          hedVersion: '8.4.0',
          checkForWarnings: true,
        };
        const result = await handleValidateHedString(args);
        expect(result).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors).toEqual([]);
        expect(result.warnings).toBeDefined();
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].code).toBe('TAG_EXTENDED');
    });

    test('should handle definitions parameter', async () => {
        // TODO: This test requires a valid definition and a HED string that uses it.
        const args: ValidateHedStringArgs = {
          hedString: 'Red, Def/myDef',
          hedVersion: '8.4.0',
          checkForWarnings: false,
          definitions: ['(Definition/myDef, (Event))']
        };
        const result = await handleValidateHedString(args);
        expect(result).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors).toEqual([]);
        expect(result.warnings).toBeDefined();
        expect(result.warnings).toEqual([]);
    });

    test('should return early with definition errors', async () => {
        const args: ValidateHedStringArgs = {
          hedString: 'Event/Sensory-event', // Valid HED string
          hedVersion: '8.4.0',
          checkForWarnings: false,
          definitions: ['(Definition/BadDef, Red)'] // Invalid definition - missing parentheses
        };
        const result = await handleValidateHedString(args);
        expect(result).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].code).toBe('DEFINITION_INVALID');
        expect(result.warnings).toBeDefined();
        expect(result.warnings).toEqual([]);
    });

    test('should include definition warnings when checkForWarnings is true', async () => {
        const args: ValidateHedStringArgs = {
          hedString: 'Event/Sensory-event', // Valid HED string
          hedVersion: '8.4.0',
          checkForWarnings: true,
          definitions: ['(Definition/WarningDef, (Red/Blech))'] 
        };
        const result = await handleValidateHedString(args);
        expect(result).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors).toEqual;
        expect(result.warnings).toBeDefined();
        expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('should not include definition warnings when checkForWarnings is false', async () => {
        const args: ValidateHedStringArgs = {
          hedString: 'Event/Sensory-event, Def/WarningDef', // Valid HED string
          hedVersion: '8.4.0',
          checkForWarnings: false,
          definitions: ['(Definition/WarningDef, (Red/Blech))']
        };
        // TODO: Implement when we have a definition that generates warnings
        const result = await handleValidateHedString(args);
        expect(result).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors).toEqual([]);
        expect(result.warnings).toBeDefined();
        expect(result.warnings).toEqual([]);
    });

    test('should combine definition warnings with HED string warnings', async () => {
        const args: ValidateHedStringArgs = {
          hedString: 'Green/Baloney, Def/WarningDef', // Valid HED string
          hedVersion: '8.4.0',
          checkForWarnings: true,
          definitions: ['(Definition/WarningDef, (Red/Blech))']
        };
        const result = await handleValidateHedString(args);
              expect(result).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors).toEqual([]);
        expect(result.warnings).toBeDefined();
        expect(result.warnings!.length).toBeGreaterThan(1); // Should have both types of warnings
    });

    test('should handle multiple valid definitions', async () => {
        const args: ValidateHedStringArgs = {
          hedString: 'Red, Def/FirstDef, Def/SecondDef',
          hedVersion: '8.4.0',
          checkForWarnings: true,
          definitions: [
            '(Definition/FirstDef, (Blue))',
            '(Definition/SecondDef, (Green))'
          ]
        };
        const result = await handleValidateHedString(args);
        expect(result).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors).toEqual([]);
        expect(result.warnings).toBeDefined();
        expect(result.warnings).toEqual([]);
    });

    test('should handle conflicting definitions', async () => {
        const args: ValidateHedStringArgs = {
          hedString: 'Event/Sensory-event', // Valid HED string 
          hedVersion: '8.4.0',
          checkForWarnings: false,
          definitions: [
            '(Definition/ConflictDef, (Red))',
            '(Definition/ConflictDef, (Blue))' // Same name, different definition
          ]
        };
        const result = await handleValidateHedString(args);
        expect(result).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.warnings).toBeDefined();
        expect(result.warnings).toEqual([]);
    });

    test('should handle empty definitions array', async () => {
        const args: ValidateHedStringArgs = {
          hedString: 'Event/Sensory-event',
          hedVersion: '8.4.0',
          checkForWarnings: false,
          definitions: []
        };
        const result = await handleValidateHedString(args);
        expect(result).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors).toEqual([]);
        expect(result.warnings).toBeDefined();
        expect(result.warnings).toEqual([]);
    });

    test('should handle malformed definition strings', async () => {
        const args: ValidateHedStringArgs = {
          hedString: 'Event/Sensory-event', // Valid HED string
          hedVersion: '8.4.0',
          checkForWarnings: false,
          definitions: [
            'Not a definition at all',
            '(Definition/ValidDef, (Green))' // Valid definition
          ]
        };
        const result = await handleValidateHedString(args);
        expect(result).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.warnings).toBeDefined();
        expect(result.warnings).toEqual([]);
    });

    test('should return an error for an invalid HED version', async () => {
        const args: ValidateHedStringArgs = {
          hedString: 'Event',
          hedVersion: 'invalid-version',
          checkForWarnings: false
        };
        const result = await handleValidateHedString(args);
        expect(result).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].code).toBe('SCHEMA_LOAD_FAILED');
        expect(result.warnings).toBeDefined();
        expect(result.warnings).toEqual([]);
    });
  });
});
