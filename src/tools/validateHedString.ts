import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { FormattedIssue, HedValidationResult } from "../types/index.js";
import { formatIssue, formatIssues, separateIssuesBySeverity } from "../utils/issueFormatter.js";
import { schemaCache } from '../utils/schemaCache.js';
import { createDefinitionManager } from '../utils/definitionProcessor.js';
import { mcpToZod } from '../utils/mcpToZod.js';

// Import HED validation functions
import { parseStandaloneString, buildSchemasFromVersion } from "hed-validator";

// Define the MCP inputSchema first
const validateHedStringInputSchema = {
  type: "object" as const,
  properties: {
    hedString: {
      type: "string" as const,
      description: "The HED string to validate"
    },
    hedVersion: {
      type: "string" as const,
      description: "The HED schema version to use (e.g., '8.4.0' or 'lang_1.1.0, score_2.1.0')"
    },
    checkForWarnings: {
      type: "boolean" as const,
      description: "Whether to check for warnings in addition to errors",
      default: false
    },
    definitions: {
      type: "array" as const,
      items: {
        type: "string" as const
      },
      description: "Array of definition strings to use during validation"
    }
  },
  required: ["hedString", "hedVersion"]
};

// Generate Zod schema from MCP schema
const ValidateHedStringSchema = mcpToZod(validateHedStringInputSchema);

export type ValidateHedStringArgs = {
  hedString: string;
  hedVersion: string;
  checkForWarnings?: boolean;
  definitions?: string[];
};

/**
 * Tool definition for validating HED strings
 */
export const validateHedString: Tool = {
  name: "validateHedString",
  description: "Validates a string of HED tags using the specified HED schema version and definitions",
  inputSchema: validateHedStringInputSchema
};

/**
 * Validate a HED string using the parseStandaloneString function
 * from the hed-javascript package.
 */
export async function handleValidateHedString(args: ValidateHedStringArgs): Promise<HedValidationResult> {
  const { hedString, hedVersion, checkForWarnings = false, definitions = [] } = args;

  try {
    // Use schema cache to get or create the HED schemas
    const hedSchemas = await schemaCache.getOrCreateSchema(hedVersion);

    // Process definitions if provided
    const definitionResult = createDefinitionManager(definitions, hedSchemas);
    
    // If there are errors in definition processing, return them immediately
    if (definitionResult.errors.length > 0) {
      return {errors: definitionResult.errors, warnings: checkForWarnings ? definitionResult.warnings : []};
    }
    
    const defManager = definitionResult.definitionManager;
    // Store definition warnings to include in final result (already formatted)
    const definitionWarnings = definitionResult.warnings;

    // Parse and validate the HED string
    const [parsedString, errors, warnings] = parseStandaloneString(hedString, hedSchemas, defManager);

    // Format and separate all validation issues
    const allErrors = formatIssues(errors);
    const allWarnings = formatIssues(warnings);
    
    // For HED string validation, errors and warnings come pre-separated from parseStandaloneString
    // But we could also use separateIssuesBySeverity if we had mixed issues
    
    // Combine definition warnings with HED string warnings (only if checkForWarnings is true)
    const finalWarnings = checkForWarnings ? [...definitionWarnings, ...allWarnings] : [];

    return { errors: allErrors, warnings: finalWarnings}; 

  } catch (error) {
    return { errors: [formatIssue(error)], warnings: []};
  }
}
