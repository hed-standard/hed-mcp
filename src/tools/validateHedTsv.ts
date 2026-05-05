import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as path from "path";
import { FormattedIssue, HedValidationResult } from "../types/index.js";
import { formatIssue, formatIssues, separateIssuesBySeverity } from "../utils/issueFormatter.js";
import { readFileFromPath } from "../utils/fileReader.js";
import { schemaCache } from '../utils/schemaCache.js';
import { createDefinitionManager } from '../utils/definitionProcessor.js';
import { mcpToZod } from '../utils/mcpToZod.js';

// Import HED validation functions
import { buildSchemasFromVersion, BidsTsvFile } from "hed-validator";

// Define the MCP inputSchema first
const validateHedTsvInputSchema = {
  type: "object" as const,
  properties: {
    filePath: {
      type: "string" as const,
      description: "The absolute path to the TSV file to validate"
    },
    hedVersion: {
      type: "string" as const,
      description: "The HED schema version to use (e.g., 8.4.0 or lang_1.1.0, score_2.1.0)"
    },
    checkForWarnings: {
      type: "boolean" as const,
      description: "Whether to check for warnings in addition to errors",
      default: false
    },
    fileData: {
      type: "string" as const,
      description: "Optional file data to use instead of reading from filePath",
      default: ""
    },
    jsonData: {
      type: "string" as const,
      description: "Optional JSON data string",
      default: ""
    },
    definitions: {
      type: "array" as const,
      items: {
        type: "string" as const
      },
      description: "Array of definition strings to use during validation"
    }
  },
  required: ["filePath", "hedVersion"]
};

// Generate Zod schema from MCP schema
const ValidateHedTsvSchema = mcpToZod(validateHedTsvInputSchema);

export type ValidateHedTsvArgs = {
  filePath: string;
  hedVersion: string;
  checkForWarnings?: boolean;
  fileData?: string;
  jsonData?: string;
  definitions?: string[];
};

/**
 * Tool definition for validating HED TSV files
 */
export const validateHedTsv: Tool = {
  name: "validateHedTsv",
  description: "Validates a HED TSV file using the specified HED schema version",
  inputSchema: validateHedTsvInputSchema
};

/**
 * Validate a HED TSV file using the specified HED schema version.
 */
export async function handleValidateHedTsv(args: ValidateHedTsvArgs): Promise<HedValidationResult> {
  const { filePath, hedVersion, checkForWarnings = false, fileData = '', jsonData = '', definitions = [] } = args;

  try {
    // Use schema cache to get or create the HED schemas
    const hedSchemas = await schemaCache.getOrCreateSchema(hedVersion);

    // Process definitions if provided
    const definitionResult = createDefinitionManager(definitions, hedSchemas);
    
    // If there are errors in definition processing, return them immediately
    if (definitionResult.errors.length > 0) {
      return {errors: definitionResult.errors, warnings: checkForWarnings ? definitionResult.warnings : []};
    }
    
    // Store definition warnings to include in final result (already formatted)
    const definitionWarnings = definitionResult.warnings;

    // Get the file data if not provided
    let data = fileData;
    if (data === undefined || data === null || data === '') {
        data = await readFileFromPath(filePath);
    }

    // Parse JSON data if provided (sidecar data)
    let parsedJsonData = null;
    if (jsonData) {
        parsedJsonData = JSON.parse(jsonData);
    }

    // Create TSV file object and validate
    const fileName = path.basename(filePath) || "events.tsv";
    const tsvFile = new BidsTsvFile(fileName, { path: filePath, name: fileName }, data, parsedJsonData || {}, 
      definitionResult.definitionManager);
    
    // Check if the TSV file has HED data to validate
    if (!tsvFile.hasHedData) {
      return {errors: [], warnings: []};
    }

    // Validate the TSV file with the HED schemas
    const validationIssues = tsvFile.validate(hedSchemas);
    
    // Format all validation issues
    const allFormattedIssues = formatIssues(validationIssues);
    
    // Separate issues by severity
    const { errors: formattedErrors, others: formattedWarnings } = separateIssuesBySeverity(allFormattedIssues);
    
    // Combine definition warnings with TSV validation warnings (only if checkForWarnings is true)
    const finalWarnings = checkForWarnings ? [...definitionWarnings, ...formattedWarnings] : [];

    return {errors: formattedErrors, warnings: finalWarnings };

  } catch (error) {
    return { errors: [formatIssue(error)], warnings: [] };
  }
}
