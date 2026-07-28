import { Issue, BidsHedIssue, IssueError } from 'hed-validator';
import { FormattedIssue } from "../types/index.js";

// Re-export FormattedIssue for backward compatibility
export type { FormattedIssue };


/**
 * Utility function to format issues into a standardized format
 * 
 * @param issues- Array of issues which can be string, plain objects, Issue objects, or IssueError objects or BidsHedIssue objects
 * @returns Array of formatted issues objects with standardized fields
 */
export function formatIssues(issues: any[]): FormattedIssue[] {
  const formattedIssues: FormattedIssue[] = [];
  for (const issue of issues) {
    formattedIssues.push(formatIssue(issue));
  }
  return formattedIssues;
}

/**
 * Format an issue into the standardized format
 * 
 * @param issue - Issue which can be a string, plain object, Issue, IssueError, or BidsHedIssue
 * @returns Formatted issue object
 */
export function formatIssue(issue: any): FormattedIssue {
  let formattedIssue: FormattedIssue;

  if (typeof issue === 'string') {
    formattedIssue = formatStringIssue(issue);
  } else if (issue instanceof IssueError) {
    formattedIssue = formatHedIssueError(issue);
  } else if (issue instanceof Error) {
    formattedIssue = formatError(issue);
  } else if (issue instanceof BidsHedIssue) {
    formattedIssue = formatBidsHedIssue(issue);
  } else if (issue instanceof Issue) {
    formattedIssue = formatHedIssue(issue);
  } else if (typeof issue === 'object' && issue !== null && !Array.isArray(issue)) {
    formattedIssue = formatPlainObject(issue);
  } else {
    // Fallback for any other type that wasn't caught.
    formattedIssue = formatUnknownIssue(issue);
  }

  return formattedIssue;
}

/**
 * Format a string into the standardized issue format
 * 
 * @param issue - String issue
 * @returns Formatted issue object
 */
function formatStringIssue(issue: string): FormattedIssue {
  const formattedIssue: FormattedIssue = {
    code: "INTERNAL_ERROR",
    detailedCode: "INTERNAL_ERROR",
    severity: "error",
    message: issue,
    column: "",
    line: "",
    location: ""
  };
  return formattedIssue;
}

/**
 * Format an IssueError into the standardized issue format
 * 
 * @param issue - IssueError object
 * @returns Formatted issue object
 */
function formatHedIssueError(issue: IssueError): FormattedIssue {
  if (issue.issue) {
    return formatHedIssue(issue.issue);
  }
  
  const formattedIssue: FormattedIssue = {
    code: 'INTERNAL_ERROR',
    detailedCode: 'INTERNAL_ERROR',
    severity: 'error',
    message: String(issue.message) || "Unknown error",
    column: "",
    line: "",
    location: ""
  };
  return formattedIssue;
}

/**
 * Format an Error into the standardized issue format
 * 
 * @param issue - Error object
 * @returns Formatted issue object
 */
function formatError(issue: Error): FormattedIssue {
 
  const formattedIssue: FormattedIssue = {
    code: 'INTERNAL_ERROR',
    detailedCode: 'INTERNAL_ERROR',
    severity: 'error',
    message: String(issue.message) || "Unknown error",
    column: "",
    line: "",
    location: ""
  };
  return formattedIssue;
}
  
/**
 * Format a HED validator Issue into the standardized format
 * 
 * @param issue - Issue object from hed-validator
 * @returns Formatted issue object
 */
function formatHedIssue(issue: Issue): FormattedIssue {
  const line = issue.parameters?.tsvLine || "";
  const column = issue.parameters?.sidecarKey || "";
  const location = issue.parameters?.filePath || "";
 
  const formattedIssue: FormattedIssue = {
    code: String(issue.hedCode),
    detailedCode: String(issue.internalCode),
    severity: String(issue.level),
    message: String(issue.message),
    column: String(column),
    line: String(line),
    location: String(location)
  };

  return formattedIssue;
}

/**
 * Format a BidsHedIssue into the standardized format
 * 
 * @param issue - BidsHedIssue object
 * @returns Formatted issue object
 */
function formatBidsHedIssue(issue: BidsHedIssue): FormattedIssue {
  const line = issue.line || (issue.hedIssue && issue.hedIssue.parameters?.tsvLine) || "";
  const column = (issue.hedIssue && issue.hedIssue.parameters?.sidecarKey) || ""; 
  const location = (issue.hedIssue && issue.hedIssue.parameters?.filePath) || "";
  const detailedCode = (issue.hedIssue && issue.hedIssue.internalCode) || "";
  const code = (issue.hedIssue && issue.hedIssue.hedCode) || issue.code || "BIDS_HED_CODE";
 

  const formattedIssue: FormattedIssue = {
    code: String(code),
    detailedCode: String(detailedCode),
    severity: String(issue.severity),
    message: String(issue.issueMessage),
    column: String(column),
    line: String(line),
    location: String(location)
  };

  return formattedIssue;
}

/**
 * Format a plain object into the standardized format
 * 
 * @param issue - Plain object error
 * @returns Formatted issue object
 */
function formatPlainObject(issue: any): FormattedIssue {
  const message = issue.message || issue.msg || issue.description || issue.issueMessage || "Unknown error";
  const severity = issue.level || issue.severity || "error";
  const type = issue.type || issue.code || "INTERNAL_ERROR";
  const line = issue.line ||issue.tsvLine || issue.lineNumber || "";
  const column = issue.column || issue.columnNumber || issue.sidecarKey || "";
  const location = issue.filePath  || "";
  const code = type.toUpperCase();
  const detailedCode = issue.subCode || issue.internalCode || "";

  const formattedIssue: FormattedIssue = {
    code: String(code),
    detailedCode: String(detailedCode),
    severity: String(severity),
    message: String(message),
    column: String(column),
    line: String(line),
    location: String(location)
  };

  return formattedIssue;
}

/**
 * Format an unknown issue type by converting it to a string.
 *
 * @param issue - The issue of unknown type.
 * @returns A formatted issue object.
 */
function formatUnknownIssue(issue: any): FormattedIssue {
  try {
    const issueAsString = String(issue);
    return formatStringIssue(issueAsString);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return formatStringIssue("INTERNAL_ERROR: " + errorMessage);
  }
}

/**
 * Separates a list of FormattedIssues into errors and non-errors based on severity.
 * 
 * @param issues - Array of FormattedIssue objects to separate
 * @returns Object containing separate arrays for errors and other issues
 */
export function separateIssuesBySeverity(issues: FormattedIssue[]): {
  errors: FormattedIssue[];
  others: FormattedIssue[];
} {
  const errors: FormattedIssue[] = [];
  const others: FormattedIssue[] = [];

  for (const issue of issues) {
    if (issue.severity === "error") {
      errors.push(issue);
    } else {
      others.push(issue);
    }
  }

  return { errors, others };
}
