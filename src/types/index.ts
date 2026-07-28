/**
 * Shared TypeScript types and interfaces for the HED MCP server
 */

import { DefinitionManager } from 'hed-validator';

/**
 * Standardized issue format for all tools and resources
 */
export interface FormattedIssue {
  code: string;
  detailedCode: string;
  severity: string;
  message: string;
  column: string;
  line: string;
  location: string;
}

export interface HedValidationResult {
  errors: FormattedIssue[];
  warnings: FormattedIssue[];
}

/**
 * Result type for definition processing operations
 */
export interface DefinitionResult {
  definitionManager: DefinitionManager | null | undefined;
  errors: FormattedIssue[];
  warnings: FormattedIssue[];
}

/**
 * Result type specifically for validateHedSidecar tool
 * Extends basic validation with the parsed sidecar data
 */
export interface ValidateHedSidecarResult {
  parsedHedSidecar: string; // Stringified JSON of the parsed sidecar data
  errors: FormattedIssue[];
  warnings: FormattedIssue[];
}
