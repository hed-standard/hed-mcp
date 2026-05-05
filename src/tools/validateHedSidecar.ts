import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as path from "path";
import { FormattedIssue, ValidateHedSidecarResult } from "../types/index.js";
import { formatIssue, formatIssues, separateIssuesBySeverity } from "../utils/issueFormatter.js";
import { readFileFromPath } from "../utils/fileReader.js";
import { schemaCache } from '../utils/schemaCache.js';
import { mcpToZod } from '../utils/mcpToZod.js';

// Import HED validation functions
import { buildSchemasFromVersion, BidsSidecar } from "hed-validator";

// Define the MCP inputSchema first
const validateHedSidecarInputSchema = {
  type: "object" as const,
  properties: {
    filePath: {
      type: "string" as const,
      description: "The absolute path to the sidecar file to validate"
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
    jsonData: {
      type: "string" as const,
      description: "Optional JSON string containing the sidecar data to use instead of reading from filePath",
      default: ""
    }
  },
  required: ["filePath", "hedVersion"]
};

// Generate Zod schema from MCP schema
const ValidateHedSidecarSchema = mcpToZod(validateHedSidecarInputSchema);

export type ValidateHedSidecarArgs = {
  filePath: string;
  hedVersion: string;
  checkForWarnings?: boolean;
  jsonData?: string;
};

/**
 * Tool definition for validating HED sidecar files
 */
export const validateHedSidecar: Tool = {
  name: "validateHedSidecar",
  description: "Validates a HED sidecar file using the specified HED schema version",
  inputSchema: validateHedSidecarInputSchema
};

/**
 * Validate a HED sidecar file using the specified HED schema version.
 */
export async function handleValidateHedSidecar(args: ValidateHedSidecarArgs): Promise<ValidateHedSidecarResult> {
  const { filePath, hedVersion, checkForWarnings = false, jsonData='' } = args;

  try {
    // Use schema cache to get or create the HED schemas
    const hedSchemas = await schemaCache.getOrCreateSchema(hedVersion);

    // Get the file data if not provided
    let data = jsonData;
    if (!data) {
        data = await readFileFromPath(filePath);
    }

    // Parse JSON data (jsonData is always a string now)
    const jsonObject = JSON.parse(data);
   
    const fileName = path.basename(filePath) || "sidecar.json"; // Properly extract filename using path.basename
    const sidecar = new BidsSidecar(fileName, { path: filePath, name: fileName }, jsonObject);
    const validationIssues = sidecar.validate(hedSchemas);
    
    // Format all validation issues
    const allFormattedIssues = formatIssues(validationIssues);
    
    // Separate issues by severity
    const { errors: formattedErrors, others: formattedWarnings } = separateIssuesBySeverity(allFormattedIssues);
    
    // Only include warnings if checkForWarnings is true
    const finalWarnings = checkForWarnings ? formattedWarnings : [];

    return {
      parsedHedSidecar: JSON.stringify(jsonObject),
      errors: formattedErrors,
      warnings: finalWarnings
    };

  } catch (error) {
    return {parsedHedSidecar: "", errors: [formatIssue(error)], warnings: []};
  }
}
