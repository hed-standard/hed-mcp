import { z } from "zod";

/**
 * Converts an MCP inputSchema to a Zod schema
 * This allows us to define the schema once in MCP format and derive Zod types from it
 */
export function mcpToZod(mcpSchema: any): z.ZodTypeAny {
  if (mcpSchema.type === "object") {
    const shape: Record<string, z.ZodTypeAny> = {};
    
    for (const [key, prop] of Object.entries(mcpSchema.properties || {})) {
      const property = prop as any;
      let zodType: z.ZodTypeAny;
      
      switch (property.type) {
        case "string":
          zodType = z.string();
          if (property.description) {
            zodType = zodType.describe(property.description);
          }
          break;
          
        case "boolean":
          zodType = z.boolean();
          if (property.description) {
            zodType = zodType.describe(property.description);
          }
          if (property.default !== undefined) {
            zodType = zodType.default(property.default);
          }
          break;
          
        case "array":
          if (property.items?.type === "string") {
            zodType = z.array(z.string());
          } else {
            zodType = z.array(z.any());
          }
          if (property.description) {
            zodType = zodType.describe(property.description);
          }
          break;
          
        default:
          zodType = z.any();
          if (property.description) {
            zodType = zodType.describe(property.description);
          }
          break;
      }
      
      // Make optional if not in required array
      if (!mcpSchema.required?.includes(key)) {
        zodType = zodType.optional();
      }
      
      shape[key] = zodType;
    }
    
    return z.object(shape);
  }
  
  // Fallback for non-object schemas
  return z.any();
}
