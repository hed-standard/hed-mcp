# HED MCP Server API Documentation

## Overview

The HED MCP (Model Context Protocol) Server provides tools and resources for validating HED (Hierarchical Event Descriptor) data. It implements the Model Context Protocol specification to expose HED validation capabilities to MCP-compatible clients.

## Server Information

- **Name**: `hed-mcp-server`
- **Version**: `1.0.0`
- **Protocol**: MCP (Model Context Protocol)
- **Transport**: stdio

## Tools

The server provides the following tools for HED validation:

### 1. validateHedString

Validates a string of HED tags using the specified HED schema version.

**Parameters:**
- `hedString` (string, required): The HED string to validate
- `hedVersion` (string, required): The HED schema version to use (e.g., '8.4.0' or 'lang_1.1.0, score_2.1.0')
- `checkForWarnings` (boolean, optional): Whether to check for warnings in addition to errors (default: false)
- `definitions` (array of strings, optional): Array of definition strings to use during validation

**Returns:**
```typescript
{
  errors: FormattedIssue[];
  warnings: FormattedIssue[];
}
```

**Example Usage:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "validateHedString",
    "arguments": {
      "hedString": "Event/Sensory-event, Red, Blue",
      "hedVersion": "8.4.0",
      "checkForWarnings": true
    }
  }
}
```

### 2. validateHedTsv

Validates a HED TSV file using the specified HED schema version.

**Parameters:**
- `filePath` (string, required): The absolute path to the TSV file to validate
- `hedVersion` (string, required): The HED schema version to use (e.g., '8.4.0' or 'lang_1.1.0, score_2.1.0')
- `checkForWarnings` (boolean, optional): Whether to check for warnings in addition to errors (default: false)
- `fileData` (string, optional): Optional file data to use instead of reading from filePath
- `jsonData` (string, optional): Optional JSON data string for sidecar information
- `definitions` (array of strings, optional): Array of definition strings to use during validation

**Returns:**
```typescript
{
  errors: FormattedIssue[];
  warnings: FormattedIssue[];
}
```

**Example Usage:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "validateHedTsv",
    "arguments": {
      "filePath": "/path/to/events.tsv",
      "hedVersion": "8.4.0",
      "checkForWarnings": true
    }
  }
}
```

### 3. parseHedSidecar

Parses a HED sidecar file using the specified HED schema version.

**Parameters:**
- `filePath` (string, required): The absolute path to the sidecar file to parse
- `hedVersion` (string, required): The HED schema version to use (e.g., '8.4.0' or 'lang_1.1.0, score_2.1.0')
- `checkForWarnings` (boolean, optional): Whether to check for warnings in addition to errors (default: false)
- `fileData` (string, optional): Optional JSON string containing the sidecar data to use instead of reading from filePath

**Returns:**
```typescript
{
  parsedHedSidecar: string; // Stringified JSON of the parsed sidecar data
  errors: FormattedIssue[];
  warnings: FormattedIssue[];
}
```

**Example Usage:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "parseHedSidecar",
    "arguments": {
      "filePath": "/path/to/task-events.json",
      "hedVersion": "8.4.0",
      "checkForWarnings": false
    }
  }
}
```

## Resources

The server provides the following resources:

### HED Schema Resource

- **URI**: `hed://schema/latest`
- **Name**: HED Schema
- **Description**: Latest HED (Hierarchical Event Descriptor) schema definition
- **MIME Type**: application/json

**Example Usage:**
```json
{
  "method": "resources/read",
  "params": {
    "uri": "hed://schema/latest"
  }
}
```

## Data Types

### FormattedIssue

Represents a validation issue (error or warning) found during HED validation.

```typescript
interface FormattedIssue {
  code: string;           // Error/warning code (e.g., 'TAG_INVALID', 'SIDECAR_INVALID')
  detailedCode: string;   // Detailed error code for programmatic handling
  severity: string;       // 'error' or 'warning'
  message: string;        // Human-readable error message
  column: string;         // Column information (if applicable)
  line: string;          // Line information (if applicable)
  location: string;      // Location information within the file
}
```

### HedValidationResult

Standard result format for validation operations.

```typescript
interface HedValidationResult {
  errors: FormattedIssue[];
  warnings: FormattedIssue[];
}
```

### ParseHedSidecarResult

Extended result format specifically for sidecar parsing operations.

```typescript
interface ParseHedSidecarResult {
  parsedHedSidecar: string; // Stringified JSON of the parsed sidecar data
  errors: FormattedIssue[];
  warnings: FormattedIssue[];
}
```

## HED Schema Versions

The server supports various HED schema versions. Common examples include:

- **Standard HED versions**: `8.3.0`, `8.4.0`, `8.5.0`
- **Library schemas**: `lang_1.1.0`, `score_2.1.0`, `testlib_2.0.0`
- **Multiple schemas**: `8.4.0, lang_1.1.0, score_2.1.0`

## Definition Support

The server supports HED definitions for enhanced validation. Definitions are specified as strings in the format:

```
(Definition/DefinitionName, (HED tags defining the definition))
```

**Examples:**
- `(Definition/MyColor, (Red))`
- `(Definition/MyAction, (Action/Move))`
- `(Definition/StimulusOnset, (Event/Sensory-event, (Onset)))`

## Error Handling

All tools follow consistent error handling patterns:

1. **Schema loading errors**: Return `SCHEMA_LOAD_FAILED` code when an invalid HED version is specified
2. **File reading errors**: Return `FILE_READ_ERROR` code when a file cannot be read
3. **JSON parsing errors**: Return `INTERNAL_ERROR` code for malformed JSON data
4. **Validation errors**: Return specific HED error codes based on the validation issue

## Client Integration

### Using with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

### Using Programmatically

The server can be integrated into any MCP-compatible client. Example server configuration:

```json
{
  "servers": {
    "hed-mcp": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "/path/to/hed-mcp-typescript"
    }
  }
}
```

## Performance Considerations

- **Schema Caching**: The server implements intelligent schema caching to avoid reloading schemas for repeated operations
- **Memory Management**: Large files are processed efficiently with streaming where possible
- **Concurrent Operations**: Multiple validation requests can be handled concurrently

## Logging and Debugging

The server logs important events to stderr:
- Server startup and initialization
- Schema cache operations
- Error conditions and exceptions

Enable verbose logging by setting appropriate environment variables in your MCP client.
