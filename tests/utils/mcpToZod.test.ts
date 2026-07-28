import { mcpToZod } from '../../src/utils/mcpToZod';
import { z } from 'zod';

describe('mcpToZod', () => {
  test('should convert basic MCP schema to Zod schema', () => {
    const mcpSchema = {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "A test string"
        },
        age: {
          type: "boolean",
          description: "A test boolean",
          default: false
        },
        tags: {
          type: "array",
          items: {
            type: "string"
          },
          description: "An array of strings"
        }
      },
      required: ["name"]
    };

    const zodSchema = mcpToZod(mcpSchema);
    
    // Test that it's a ZodObject
    expect(zodSchema).toBeInstanceOf(z.ZodObject);
    
    // Test valid data
    const validData = {
      name: "test",
      age: true,
      tags: ["tag1", "tag2"]
    };
    
    const result = zodSchema.safeParse(validData);
    expect(result.success).toBe(true);
    
    // Test that optional fields work
    const minimalData = {
      name: "test"
    };
    
    const minimalResult = zodSchema.safeParse(minimalData);
    expect(minimalResult.success).toBe(true);
  });

  test('should handle missing properties gracefully', () => {
    const mcpSchema = {
      type: "object",
      required: []
    };

    const zodSchema = mcpToZod(mcpSchema);
    const result = zodSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  test('should handle non-object schemas', () => {
    const mcpSchema = {
      type: "string"
    };

    const zodSchema = mcpToZod(mcpSchema);
    // Should fallback to z.any() for non-object schemas
    expect(zodSchema).toBeInstanceOf(z.ZodAny);
  });
});
