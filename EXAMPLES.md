# HED MCP Server Usage Examples

This document provides practical examples of using the HED MCP Server for various validation tasks.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [HED String Validation](#hed-string-validation)
3. [TSV File Validation](#tsv-file-validation)
4. [Sidecar File Parsing](#sidecar-file-parsing)
5. [Working with Definitions](#working-with-definitions)
6. [Multi-Schema Validation](#multi-schema-validation)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

## Basic Setup

### Starting the Server

```bash
# Build the server first
npm run build

# Option 1: Use MCP Inspector (recommended for testing)
npx @modelcontextprotocol/inspector node dist/server.js

# Option 2: Run directly (for programmatic use)
node dist/server.js

# Option 3: Use the test client
node test-mcp-client.js
```

### MCP Client Configuration

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

## HED String Validation

### Example 1: Basic HED String Validation

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "validateHedString",
    "arguments": {
      "hedString": "Event/Sensory-event, Red, Blue",
      "hedVersion": "8.4.0"
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"errors\": [],\n  \"warnings\": []\n}"
      }
    ]
  }
}
```

### Example 2: HED String with Warnings

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "validateHedString",
    "arguments": {
      "hedString": "Event, Item/MyCustomObject",
      "hedVersion": "8.4.0",
      "checkForWarnings": true
    }
  }
}
```

**Response (with warning):**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"errors\": [],\n  \"warnings\": [\n    {\n      \"code\": \"TAG_EXTENDED\",\n      \"detailedCode\": \"extensionAllowed\",\n      \"severity\": \"warning\",\n      \"message\": \"WARNING: [TAG_EXTENDED] This tag is not recommended. A more specific tag should be used instead. (For more information on this HED error, see https://hed-specification.readthedocs.io/en/latest/Appendix_B.html#tag-extended.)\",\n      \"column\": \"\",\n      \"line\": \"\",\n      \"location\": \"\"\n    }\n  ]\n}"
      }
    ]
  }
}
```

### Example 3: Invalid HED String

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "validateHedString",
    "arguments": {
      "hedString": "InvalidTag, AnotherInvalidTag",
      "hedVersion": "8.4.0"
    }
  }
}
```

**Response (with errors):**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"errors\": [\n    {\n      \"code\": \"TAG_INVALID\",\n      \"detailedCode\": \"invalidTag\",\n      \"severity\": \"error\",\n      \"message\": \"ERROR: [TAG_INVALID] This tag is not valid. (For more information on this HED error, see https://hed-specification.readthedocs.io/en/latest/Appendix_B.html#tag-invalid.)\",\n      \"column\": \"\",\n      \"line\": \"\",\n      \"location\": \"\"\n    }\n  ],\n  \"warnings\": []\n}"
      }
    ]
  }
}
```

## TSV File Validation

### Example 4: Validate TSV File from Path

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "validateHedTsv",
    "arguments": {
      "filePath": "/data/sub-01_task-rest_events.tsv",
      "hedVersion": "8.4.0",
      "checkForWarnings": true
    }
  }
}
```

### Example 5: Validate TSV with Inline Data

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "validateHedTsv",
    "arguments": {
      "filePath": "/virtual/events.tsv",
      "hedVersion": "8.4.0",
      "fileData": "onset\tduration\ttrial_type\tHED\n1.0\t2.0\tgo\tEvent/Sensory-event, Red\n3.0\t2.0\tstop\tEvent/Sensory-event, Blue",
      "checkForWarnings": false
    }
  }
}
```

### Example 6: TSV with Sidecar Data

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "validateHedTsv",
    "arguments": {
      "filePath": "/data/sub-01_task-rest_events.tsv",
      "hedVersion": "8.4.0",
      "jsonData": "{\"trial_type\": {\"go\": {\"HED\": \"Event/Sensory-event, (Green, Large)\"}, \"stop\": {\"HED\": \"Event/Sensory-event, (Red, Large)\"}}}",
      "checkForWarnings": true
    }
  }
}
```

## Sidecar File Parsing

### Example 7: Parse Sidecar File

```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "parseHedSidecar",
    "arguments": {
      "filePath": "/data/task-rest_events.json",
      "hedVersion": "8.4.0",
      "checkForWarnings": true
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"parsedHedSidecar\": \"{\\\"trial_type\\\": {\\\"go\\\": {\\\"HED\\\": \\\"Event/Sensory-event, Green\\\"}, \\\"stop\\\": {\\\"HED\\\": \\\"Event/Sensory-event, Red\\\"}}}\",\n  \"errors\": [],\n  \"warnings\": []\n}"
      }
    ]
  }
}
```

### Example 8: Parse Inline Sidecar Data

```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "tools/call",
  "params": {
    "name": "parseHedSidecar",
    "arguments": {
      "filePath": "/virtual/sidecar.json",
      "hedVersion": "8.4.0",
      "fileData": "{\"response\": {\"HED\": \"Action/Move, Agent/Human\"}, \"stimulus\": {\"HED\": \"Event/Sensory-event, (Red, Large)\"}}"
    }
  }
}
```

## Working with Definitions

### Example 9: Using Definitions in Validation

```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "method": "tools/call",
  "params": {
    "name": "validateHedString",
    "arguments": {
      "hedString": "Def/Fixation, Blue, Def/Response",
      "hedVersion": "8.4.0",
      "definitions": [
        "(Definition/Fixation, (Event/Sensory-event, (Onset)))",
        "(Definition/Response, (Action/Move, Agent/Human))"
      ],
      "checkForWarnings": true
    }
  }
}
```

### Example 10: TSV Validation with Definitions

```json
{
  "jsonrpc": "2.0",
  "id": 10,
  "method": "tools/call",
  "params": {
    "name": "validateHedTsv",
    "arguments": {
      "filePath": "/data/events.tsv",
      "hedVersion": "8.4.0",
      "definitions": [
        "(Definition/StimulusOnset, (Event/Sensory-event, (Onset)))",
        "(Definition/ButtonPress, (Action/Move, Agent/Human, (Voluntary)))",
        "(Definition/CorrectResponse, (Def/ButtonPress, (Correct-action)))"
      ],
      "checkForWarnings": false
    }
  }
}
```

### Example 11: Invalid Definition (Error Case)

```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "method": "tools/call",
  "params": {
    "name": "validateHedString",
    "arguments": {
      "hedString": "Event/Sensory-event",
      "hedVersion": "8.4.0",
      "definitions": [
        "(Definition/BadDef, Red)",  // Missing parentheses around definition content
        "(Definition/GoodDef, (Blue))"
      ]
    }
  }
}
```

**Response (definition error):**
```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"errors\": [\n    {\n      \"code\": \"DEFINITION_INVALID\",\n      \"detailedCode\": \"invalidDefinition\",\n      \"severity\": \"error\",\n      \"message\": \"ERROR: [DEFINITION_INVALID] The definition is not properly formatted.\",\n      \"column\": \"\",\n      \"line\": \"\",\n      \"location\": \"\"\n    }\n  ],\n  \"warnings\": []\n}"
      }
    ]
  }
}
```

## Multi-Schema Validation

### Example 12: Using Multiple Schemas

```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "method": "tools/call",
  "params": {
    "name": "validateHedString",
    "arguments": {
      "hedString": "Event/Sensory-event, (Language-item, Nonsense-word), (Score, 0.5)",
      "hedVersion": "8.4.0, lang_1.1.0, score_2.1.0",
      "checkForWarnings": true
    }
  }
}
```

### Example 13: Library Schema Only

```json
{
  "jsonrpc": "2.0",
  "id": 13,
  "method": "tools/call",
  "params": {
    "name": "validateHedString",
    "arguments": {
      "hedString": "(Language-item, Word, (Length, 5))",
      "hedVersion": "lang_1.1.0",
      "checkForWarnings": false
    }
  }
}
```

## Error Handling

### Example 14: Invalid Schema Version

```json
{
  "jsonrpc": "2.0",
  "id": 14,
  "method": "tools/call",
  "params": {
    "name": "validateHedString",
    "arguments": {
      "hedString": "Event/Sensory-event",
      "hedVersion": "999.999.999"
    }
  }
}
```

**Response (schema error):**
```json
{
  "jsonrpc": "2.0",
  "id": 14,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"errors\": [\n    {\n      \"code\": \"SCHEMA_LOAD_FAILED\",\n      \"detailedCode\": \"schemaLoadFailed\",\n      \"severity\": \"error\",\n      \"message\": \"ERROR: [SCHEMA_LOAD_FAILED] Could not load the specified HED schema version.\",\n      \"column\": \"\",\n      \"line\": \"\",\n      \"location\": \"\"\n    }\n  ],\n  \"warnings\": []\n}"
      }
    ]
  }
}
```

### Example 15: File Not Found

```json
{
  "jsonrpc": "2.0",
  "id": 15,
  "method": "tools/call",
  "params": {
    "name": "validateHedTsv",
    "arguments": {
      "filePath": "/nonexistent/file.tsv",
      "hedVersion": "8.4.0"
    }
  }
}
```

**Response (file error):**
```json
{
  "jsonrpc": "2.0",
  "id": 15,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"errors\": [\n    {\n      \"code\": \"FILE_READ_ERROR\",\n      \"detailedCode\": \"fileReadError\",\n      \"severity\": \"error\",\n      \"message\": \"ERROR: [FILE_READ_ERROR] Could not read the specified file.\",\n      \"column\": \"\",\n      \"line\": \"\",\n      \"location\": \"\"\n    }\n  ],\n  \"warnings\": []\n}"
      }
    ]
  }
}
```

## Best Practices

### 1. Schema Version Management

```javascript
// Good: Use specific, stable versions
"hedVersion": "8.4.0"

// Good: Combine stable versions for library schemas
"hedVersion": "8.4.0, lang_1.1.0, score_2.1.0"

// Avoid: Using development or unstable versions in production
```

### 2. Warning Management

```javascript
// Development: Check for warnings to catch potential issues
"checkForWarnings": true

// Production: Disable warnings for performance if not needed
"checkForWarnings": false
```

### 3. Definition Organization

```javascript
// Good: Organize definitions logically
const definitions = [
  // Event definitions
  "(Definition/StimulusOnset, (Event/Sensory-event, (Onset)))",
  "(Definition/StimulusOffset, (Event/Sensory-event, (Offset)))",
  
  // Action definitions  
  "(Definition/ButtonPress, (Action/Move, Agent/Human))",
  "(Definition/CorrectResponse, (Def/ButtonPress, (Correct-action)))"
];
```

### 4. Error Handling in Client Code

```javascript
async function validateHedData(hedString, hedVersion) {
  try {
    const response = await mcpClient.call('tools/call', {
      name: 'validateHedString',
      arguments: { hedString, hedVersion }
    });
    
    const result = JSON.parse(response.content[0].text);
    
    if (result.errors.length > 0) {
      console.error('Validation errors:', result.errors);
      return false;
    }
    
    if (result.warnings.length > 0) {
      console.warn('Validation warnings:', result.warnings);
    }
    
    return true;
  } catch (error) {
    console.error('MCP call failed:', error);
    return false;
  }
}
```

### 5. Batch Processing

For processing multiple files, reuse the server connection:

```javascript
// Good: Single server instance for multiple operations
const server = new MCPServer();
await server.connect();

for (const file of files) {
  const result = await server.call('validateHedTsv', {
    filePath: file,
    hedVersion: '8.4.0'
  });
  // Process result...
}

await server.disconnect();
```

### 6. Resource Management

```javascript
// Use inline data for small datasets to avoid file I/O
{
  "name": "validateHedTsv",
  "arguments": {
    "filePath": "/virtual/data.tsv",  // Virtual path
    "fileData": "onset\tduration\tHED\n1.0\t2.0\tEvent/Sensory-event",
    "hedVersion": "8.4.0"
  }
}
```

## Common Use Cases

### Validating BIDS Datasets

```bash
# 1. Validate event files
for file in sub-*/ses-*/func/*_events.tsv; do
  echo "Validating $file..."
  # Call validateHedTsv tool
done

# 2. Check sidecar files
for file in task-*_events.json; do
  echo "Parsing $file..."
  # Call parseHedSidecar tool  
done
```

### Interactive Development

Use the MCP Inspector for rapid prototyping and testing:

```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

This provides a web interface for:
- Testing tool calls interactively
- Viewing formatted responses
- Debugging schema and validation issues
- Exploring available tools and resources

### Integration Testing

Create test suites that validate against known good and bad data:

```javascript
describe('HED Validation Integration', () => {
  test('should validate good HED strings', async () => {
    const result = await callTool('validateHedString', {
      hedString: 'Event/Sensory-event, Red',
      hedVersion: '8.4.0'
    });
    expect(result.errors).toHaveLength(0);
  });
  
  test('should detect invalid HED strings', async () => {
    const result = await callTool('validateHedString', {
      hedString: 'InvalidTag',
      hedVersion: '8.4.0'
    });
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```
