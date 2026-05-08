# HED MCP TypeScript Server

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.16.0-green)](https://modelcontextprotocol.io/)
[![Maintainability](https://qlty.sh/gh/hed-standard/projects/hed-mcp/maintainability.svg)](https://qlty.sh/gh/hed-standard/projects/hed-mcp)
[![Code Coverage](https://qlty.sh/gh/hed-standard/projects/hed-mcp/coverage.svg)](https://qlty.sh/gh/hed-standard/projects/hed-mcp)
## Introduction

A Model Context Protocol (MCP) server for validating HED (Hierarchical Event Descriptor) data. This server provides comprehensive HED validation tools through the standardized MCP interface, making HED validation accessible to any MCP-compatible client.

### What is HED?

HED (Hierarchical Event Descriptor) is:
- A standardized vocabulary for describing experimental events
- A hierarchical system that allows for precise event annotation
- Widely used in BIDS (Brain Imaging Data Structure) datasets
- Essential for reproducible neuroscience research

### What is MCP?

Model Context Protocol (MCP) is:
- A standardized protocol for tool and resource sharing
- Enables AI assistants and applications to access external capabilities
- Provides a consistent interface across different implementations
- Facilitates integration between diverse software systems

## Features

- **HED string validation**: Validate individual HED tag strings against schema specifications
- **TSV file validation**: Validate entire BIDS TSV files containing HED annotations
- **JSON sidecar validation**: Parse and validate HED sidecar JSON files
- **File system access**: Read files from local filesystem paths
- **Multi-schema support**: Support for standard HED schemas and library schemas
- **Definition processing**: Handle HED definitions for enhanced validation
- **Warning detection**: Optional warning detection in addition to error reporting
- **Schema caching**: Intelligent caching system for optimal performance
- **Multiple interfaces**: MCP server (stdio/WebSocket) + HTTP REST API
- **Browser compatibility**: Full browser support with multiple integration options

## Table of contents

- [Understanding HED](#understanding-hed)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Server Architecture](#server-architecture)
- [Available Tools](#available-tools)
- [Usage Examples](#usage-examples)
- [Working with HED Data](#working-with-hed-data)
- [Browser Usage](#browser-usage)
- [Configuration](#configuration)
- [Advanced Features](#advanced-features)
- [Performance Optimization](#performance-optimization)
- [Integration Guide](#integration-guide)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Understanding HED

### HED Basics

HED uses a hierarchical tag structure where tags are organized from general to specific:

```
Event                 # General event type
Event/Sensory-event   # More specific
Sensory-event         # Same as Event/Sensory-event 
```

The hierarchical structure is used for search generality -- allowing a search for `Event` to pick up `Event/Sensory-event` as well as `Sensory-event`.

**Note**: All tags in the HED vocabulary are unique. It is recommended that you annotate using just the tag, not the full path.

### Tag Structure

- **Path notation**: Tags use forward slashes to indicate hierarchy
- **Grouping**: Parentheses group related tags: `(Red, Large)`
- **Definitions**: Custom definitions can be used for complex concepts
- **Extension**: Custom subtags can be added for specialization

### Common HED Patterns

#### Basic event description
```
Sensory-event, Red
```

#### Grouped Tags
```
Sensory-event, (Red, Square)
```

#### Using Definitions

You can create definitions to represent strings of tags that you frequently use:
```
(Definition/BlueSquare, ((Background-view, Black), ((Blue, Square), (Center-of, Computer-Screen))))
```
The annotation:
```
Def/BlueSquare
```
can appear anywhere a normal HED tag would.
Tools can substitute the full annotation when needed.

### Schema Versions

HED schemas evolve over time. Use the latest version whenever possible:

- **Standard HED**: `8.4.0` - Basic vocabulary 
- **Library schemas**: 
  - `lang_1.1.0` - Language-related tags
  - `score_2.1.0` - EEG features based on SCORE standard

## Installation

### Prerequisites

Before using the HED MCP Server, ensure you have:

1. **Node.js 22+**: Download from [nodejs.org](https://nodejs.org/)
2. **Basic understanding of HED**: Familiarity with HED concepts is helpful
3. **MCP-compatible client**: Such as the MCP Inspector or custom client

### Install Dependencies

```bash
npm install
```

### Build the Server

```bash
npm run build
```

This creates the distribution files in the `dist/` directory.

### Test the Installation

```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

## Server Architecture

### Core Components

```
HED MCP Server (src)
├── server.ts              # Main MCP server (stdio/WebSocket modes)
├── tools/                 # Validation functions
│   ├── validateHedString.ts
│   ├── validateHedTsv.ts
│   ├── validateHedSidecar.ts
│   └── getFileFromPath.ts
├── resources/             # Schema Information
│   └── hedSchema.ts
├── utils/                 # Utilities
│   ├── definitionProcessor.ts
│   ├── fileReader.ts
│   ├── issueFormatter.ts
│   ├── mcpToZod.ts
│   └── schemaCache.ts     # Schema caching system
└── types/                 # TypeScript definitions

Examples (examples/)
├── definition-usage.ts    # Example of HED definition processing
├── hed-demo.html          # Interactive demo and integration guide
├── hed-validator-client.js # Modern browser client for HED validation
├── hed-validator.css      # Styles for the browser interface
├── hed-validator.html     # Full-featured browser validation interface
├── http-server.ts         # HTTP REST API server example
├── mcp-client.js          # Interactive MCP client example
├── README.md              # README for the examples
└── test-server.js         # Automated server testing script
```

### Data Flow

1. **Client request** → MCP server
2. **Schema loading** → Cache or load from network
3. **Data processing** → Parse and validate
4. **Issue formatting** → Standardize error/Warning format
5. **Response** → Return to client

### Caching system

The server implements intelligent caching:

- **Schema caching**: Avoids reloading schemas for repeated operations
- **Definition caching**: Reuses processed definitions
- **Memory management**: Automatic cleanup of unused cache entries

## Quick start

### Run with MCP Inspector

The fastest way to test the server is using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

This opens a web interface where you can interact with the server and test all available tools.

### Basic server rest

Test the server directly:

```bash
# Standard MCP server (stdio mode)
npm start

# WebSocket mode  
node dist/server.js --websocket --port=8080

# HTTP REST API server
npm run start:http
```

Or test with the included client:

```bash
node test-mcp-client.js
```

### First steps

1. **Open the MCP Inspector** in your browser
2. **Initialize the server** - this happens automatically
3. **List available tools** to see what's available
4. **Try a simple validation** with `validateHedString`

## Available tools

| Tool | Description | Required parameters | Optional parameters |
|------|-------------|-------------------|-------------------|
| `validateHedString` | Validates HED tag strings | `hedString`, `hedVersion` | `checkForWarnings`, `definitions` |
| `validateHedTsv` | Validates TSV files with HED | `filePath`, `hedVersion` | `checkForWarnings`, `fileData`, `jsonData`, `definitions` |
| `validateHedSidecar` | Validates HED sidecar JSON files | `filePath`, `hedVersion` | `checkForWarnings`, `fileData` |
| `getFileFromPath` | Reads files from filesystem | `filePath` | |

### Tool reference

#### validateHedString

**Purpose**: Validates individual HED tag strings

**When to use**:
- Testing specific HED constructs
- Interactive validation during annotation
- Validating programmatically generated HED strings

**Parameters**:
- `hedString` (required): The HED string to validate
- `hedVersion` (required): Schema version (e.g., "8.4.0")
- `checkForWarnings` (optional): Include warnings in results
- `definitions` (optional): Array of definition strings

**Best practices**:
- Use specific schema versions in production
- Enable warnings during development
- Group related definitions together

#### validateHedTsv

**Purpose**: Validates TSV files containing HED annotations

**When to use**:
- Validating BIDS event files
- Checking TSV files before publication
- Automated dataset validation

**Parameters**:
- `filePath` (required): Path to TSV file
- `hedVersion` (required): Schema version
- `checkForWarnings` (optional): Include warnings
- `fileData` (optional): Inline TSV data
- `jsonData` (optional): Sidecar data as JSON string
- `definitions` (optional): Definition strings

**Best practices**:
- Use `fileData` for small datasets to avoid file I/O
- Include sidecar data via `jsonData` for complete validation
- Process files in batches for large datasets

#### validateHedSidecar

**Purpose**: Validates HED sidecar JSON files

**When to use**:
- Validating BIDS sidecar files
- Checking JSON structure and HED content
- Converting between sidecar formats

**Parameters**:
- `filePath` (required): Path to JSON sidecar file
- `hedVersion` (required): Schema version
- `checkForWarnings` (optional): Include warnings
- `fileData` (optional): Inline JSON data

**Best practices**:
- Validate sidecar files before TSV files
- Use parsed output for debugging sidecar structure
- Check both structure and HED content validity

#### getFileFromPath

**Purpose**: Retrieves files from the local filesystem

**When to use**:
- Reading configuration files
- Accessing data files for validation
- File system operations

**Parameters**:
- `filePath` (required): Absolute path to the file

**Best practices**:
- Use absolute file paths
- Check file permissions and existence
- Handle file encoding properly (UTF-8 recommended)

## Usage examples

### Validate a HED string

```json
{
  "method": "tools/call",
  "params": {
    "name": "validateHedString",
    "arguments": {
      "hedString": "Event/Sensory-event, Red, Blue, (Green, Large)",
      "hedVersion": "8.4.0",
      "checkForWarnings": true
    }
  }
}
```

### Validate a TSV File

```json
{
  "method": "tools/call",
  "params": {
    "name": "validateHedTsv",
    "arguments": {
      "filePath": "/tests/data/sub-002_ses-1_task-FacePerception_run-1_events.tsv",
      "hedVersion": "8.4.0",
      "checkForWarnings": true,
      "definitions": [
        "(Definition/Fixation, (Sensory-event, Visual-presentation, (Image, Cross))",
        "(Definition/ButtonPress, (Press, Mouse-button))"
      ]
    }
  }
}
```

### Validate a BIDS JSON sidecar

```json
{
  "method": "tools/call",
  "params": {
    "name": "validateHedSidecar",
    "arguments": {
      "filePath": "/tests/data/task-FacePerception_events.json",
      "hedVersion": "8.4.0",
      "checkForWarnings": false
    }
  }
}
```

### Read a File

```json
{
  "method": "tools/call",
  "params": {
    "name": "getFileFromPath",
    "arguments": {
      "filePath": "/path/to/data/events.tsv"
    }
  }
}
```

## Working with HED Data

### Validation Workflow

1. **Schema Selection**: Choose appropriate HED schema version
2. **Definition Setup**: Prepare any custom definitions
3. **Data Validation**: Run appropriate validation tool
4. **Issue Resolution**: Address errors and warnings
5. **Quality Assurance**: Final validation with warnings enabled

### Common Validation Scenarios

#### Scenario 1: New Dataset Validation

```json
// 1. First validate sidecar files
{
  "name": "validateHedSidecar",
  "arguments": {
    "filePath": "/data/task-rest_events.json",
    "hedVersion": "8.4.0",
    "checkForWarnings": true
  }
}

// 2. Then validate TSV files with sidecar data
{
  "name": "validateHedTsv", 
  "arguments": {
    "filePath": "/data/sub-01_task-rest_events.tsv",
    "hedVersion": "8.4.0",
    "jsonData": "{...sidecar content...}",
    "checkForWarnings": true
  }
}
```

#### Scenario 2: Interactive Annotation

```json
// Test individual HED strings during annotation
{
  "name": "validateHedString",
  "arguments": {
    "hedString": "Event/Sensory-event, (Red, Large)",
    "hedVersion": "8.4.0",
    "checkForWarnings": true
  }
}
```

#### Scenario 3: Definition Development

```json
// Test definitions before using in datasets
{
  "name": "validateHedString",
  "arguments": {
    "hedString": "Def/MyStimulus, Blue",
    "hedVersion": "8.4.0", 
    "definitions": [
      "(Definition/MyStimulus, (Event/Sensory-event, (Onset)))"
    ],
    "checkForWarnings": true
  }
}
```

### Error interpretation

#### Common error types

1. **TAG_INVALID**: Tag not found in schema
   - Check spelling and capitalization
   - Verify tag exists in specified schema version
   - Consider using extension tags if appropriate

2. **DEFINITION_INVALID**: Malformed definition
   - Ensure proper parentheses around definition content
   - Check that definition name follows conventions
   - Verify definition content is valid HED

3. **SCHEMA_LOAD_FAILED**: Invalid schema version
   - Verify schema version exists
   - Check network connectivity for schema download
   - Use stable, released schema versions

4. **FILE_READ_ERROR**: Cannot read specified file
   - Verify file path and permissions
   - Check file exists and is readable
   - Consider using inline data for virtual files

#### Warning types

1. **TAG_EXTENDED**: Extension tag used
   - Consider using more specific standard tags
   - Acceptable for novel experimental paradigms
   - Document extensions for reproducibility

2. **DEFINITION_WARNING**: Definition issues
   - Non-critical definition problems
   - May indicate style or convention issues
   - Review definition structure and content

### Data quality guidelines

#### High-quality HED annotations

1. **Specificity**: Use most specific appropriate tags
2. **Consistency**: Apply same annotation patterns throughout dataset
3. **Completeness**: Annotate all relevant aspects of events
4. **Accuracy**: Ensure annotations match actual experimental events

#### Quality checklist

- [ ] All files validate without errors
- [ ] Warnings reviewed and addressed where appropriate
- [ ] Definitions properly documented
- [ ] Schema version appropriate for dataset
- [ ] Annotations consistent across similar events

## Browser usage

The HED MCP server can be used in browsers through several approaches. All browser files are located in the `examples/` directory.

### Option 1: Complete Validation Interface

Open `examples/hed-validator.html` for a full-featured web interface:

- **Multiple validation modes**: String, TSV, and Sidecar validation
- **Modern UI**: Clean, responsive design with professional styling  
- **Real-time feedback**: Instant validation results with detailed error reporting
- **Multiple HED versions**: Support for different schema versions and libraries

```bash
# Serve the examples locally
npx serve examples/

# Or open directly in browser
open examples/hed-validator.html
```

### Option 2: Interactive Demo & Integration Guide

View `examples/hed-demo.html` for:

- **Live examples**: Pre-configured validation scenarios
- **Integration guide**: Complete API documentation and code examples
- **Developer tools**: Quick validation form for testing

### Option 3: Browser Client Library

Include the modern browser client in your web application:

```html
<link rel="stylesheet" href="examples/hed-validator.css">
<script src="examples/hed-validator-client.js"></script>
<script>
  // Create validator client (auto-detects server availability)
  const validator = new HEDValidatorClient();
  
  // Validate HED string
  const result = await validator.validateString('Event/Sensory-event, Red');
  
  // Or create a pre-built validation form
  HEDValidatorClient.createValidationForm('my-container');
</script>
```

### Option 4: Full HTTP API Integration

For complete server-based validation, run the HTTP API server:

```bash
npm run build
node dist/examples/http-server.js
```

The browser client automatically detects and uses the server at `http://localhost:3000/api/hed/`.

**Quick Start**: Open `examples/hed-validator.html` to immediately start validating HED data in your browser!

### Web application integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>HED Validator</title>
</head>
<body>
    <textarea id="hedInput" placeholder="Enter HED string..."></textarea>
    <button onclick="validateHED()">Validate</button>
    <div id="results"></div>

    <script>
        async function validateHED() {
            const hedString = document.getElementById('hedInput').value;
            
            try {
                const response = await fetch('/api/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        hedString,
                        hedVersion: '8.4.0',
                        checkForWarnings: true
                    })
                });
                
                const result = await response.json();
                displayResults(result);
            } catch (error) {
                console.error('Validation failed:', error);
            }
        }
        
        function displayResults(result) {
            const resultsDiv = document.getElementById('results');
            
            if (result.errors.length === 0) {
                resultsDiv.innerHTML = '<p style="color: green;">Valid HED string!</p>';
            } else {
                resultsDiv.innerHTML = '<p style="color: red;">Validation errors:</p>';
                result.errors.forEach(error => {
                    resultsDiv.innerHTML += `<p>• ${error.message}</p>`;
                });
            }
            
            if (result.warnings.length > 0) {
                resultsDiv.innerHTML += '<p style="color: orange;">Warnings:</p>';
                result.warnings.forEach(warning => {
                    resultsDiv.innerHTML += `<p>• ${warning.message}</p>`;
                });
            }
        }
    </script>
</body>
</html>
```

## Configuration

### MCP client configuration

Add to your MCP client configuration:

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

### WebSocket mode

Run the server in WebSocket mode for browser-based MCP clients:

```bash
node dist/server.js --websocket --port=8080
```

### Environment variables

The server respects standard Node.js environment variables:

- `NODE_ENV`: Set to `development` for verbose logging
- `DEBUG`: Enable debug output for troubleshooting

### Debug mode

Enable debug logging:

```bash
DEBUG=* node dist/server.js
```

Or in MCP client configuration:

```json
{
  "servers": {
    "hed-mcp": {
      "command": "node",
      "args": ["dist/server.js"],
      "env": {
        "DEBUG": "*"
      }
    }
  }
}
```

### Definition management

#### Definition best practices

1. **Naming**: Use descriptive, unique names
2. **Structure**: Keep definitions simple and focused
3. **Reusability**: Design for reuse across similar experiments
4. **Documentation**: Document purpose and usage

#### Definition examples

```javascript
// Simple stimulus definition
"(Definition/RedCircle, (Event/Sensory-event, (Red, Circle)))"

// Complex behavioral definition  
"(Definition/CorrectResponse, (Action/Move, Agent/Human, (Correct-action, (Voluntary))))"

// Hierarchical definitions
"(Definition/VisualStimulus, (Event/Sensory-event, Property/Sensory-property/Visual))"
"(Definition/RedVisualStimulus, (Def/VisualStimulus, Red))"
```


## Performance optimization

### Schema caching

The server automatically caches loaded schemas to improve performance:

```typescript
// Schemas are cached by version string
const schema1 = await schemaCache.getOrCreateSchema('8.4.0');
const schema2 = await schemaCache.getOrCreateSchema('8.4.0'); // Uses cache
```

### Definition reuse

Process definitions once and reuse:

```javascript
// Define once, use multiple times
const definitions = [
  "(Definition/Fixation, (Event/Sensory-event, (Onset)))",
  "(Definition/Response, (Action/Move, Agent/Human))"
];

// Use in multiple validations
for (const hedString of hedStrings) {
  const result = await validate({
    hedString,
    hedVersion: '8.4.0',
    definitions  // Reuse same definitions
  });
}
```

### Batch operations

```javascript
// Efficient batch processing
const server = new MCPServer();
await server.connect();

try {
  const results = await Promise.all(
    files.map(file => 
      server.call('validateHedTsv', {
        filePath: file,
        hedVersion: '8.4.0'
      })
    )
  );
} finally {
  await server.disconnect();
}
```

### Performance tips

#### Memory usage

- Monitor memory usage with large datasets
- Process files in batches if memory constrained
- Clear unused schema cache entries
- Use streaming for very large files

#### Speed optimization

- Reuse server connections for multiple operations
- Cache schemas and definitions between operations
- Use inline data to avoid file I/O overhead
- Disable warnings for production validation

## Integration guide

### MCP client integration

#### Basic client setup

```javascript
import { MCPClient } from '@modelcontextprotocol/client';

const client = new MCPClient({
  server: {
    command: 'node',
    args: ['dist/server.js'],
    cwd: '/path/to/hed-mcp-typescript'
  }
});

await client.connect();
```

#### Error handling

```javascript
async function safeValidation(hedString, hedVersion) {
  try {
    const response = await client.call('tools/call', {
      name: 'validateHedString',
      arguments: { hedString, hedVersion }
    });
    
    const result = JSON.parse(response.content[0].text);
    
    return {
      success: result.errors.length === 0,
      errors: result.errors,
      warnings: result.warnings
    };
  } catch (error) {
    return {
      success: false,
      errors: [{ 
        code: 'CLIENT_ERROR',
        message: error.message,
        severity: 'error'
      }],
      warnings: []
    };
  }
}
```

### Python integration

```python
import asyncio
import json
from mcp_client import MCPClient

class HEDValidator:
    def __init__(self, server_path):
        self.client = MCPClient(server_path)
    
    async def __aenter__(self):
        await self.client.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.disconnect()
    
    async def validate_string(self, hed_string, hed_version="8.4.0", check_warnings=True):
        """Validate a HED string."""
        response = await self.client.call('tools/call', {
            'name': 'validateHedString',
            'arguments': {
                'hedString': hed_string,
                'hedVersion': hed_version,
                'checkForWarnings': check_warnings
            }
        })
        
        return json.loads(response['content'][0]['text'])
    
    async def validate_file(self, file_path, hed_version="8.4.0", definitions=None):
        """Validate a TSV file."""
        args = {
            'filePath': file_path,
            'hedVersion': hed_version,
            'checkForWarnings': True
        }
        
        if definitions:
            args['definitions'] = definitions
        
        response = await self.client.call('tools/call', {
            'name': 'validateHedTsv',
            'arguments': args
        })
        
        return json.loads(response['content'][0]['text'])

# Usage example
async def main():
    async with HEDValidator('/path/to/hed-mcp-typescript/dist/server.js') as validator:
        # Validate a HED string
        result = await validator.validate_string(
            "Event/Sensory-event, Red, Blue",
            hed_version="8.4.0"
        )
        
        if result['errors']:
            print("Validation errors found:")
            for error in result['errors']:
                print(f"  - {error['message']}")
        else:
            print("HED string is valid!")

if __name__ == "__main__":
    asyncio.run(main())
```

### Command line integration

```bash
#!/bin/bash
# validate-dataset.sh - Validate all HED files in a BIDS dataset

DATASET_DIR="$1"
HED_VERSION="8.4.0"

echo "Validating BIDS dataset: $DATASET_DIR"

# Validate sidecar files
find "$DATASET_DIR" -name "*_events.json" | while read file; do
    echo "Validating sidecar: $file"
    # Call validateHedSidecar via MCP client
    validate_sidecar "$file" "$HED_VERSION"
done

# Validate TSV files  
find "$DATASET_DIR" -name "*_events.tsv" | while read file; do
    echo "Validating TSV: $file"
    # Call validateHedTsv via MCP client
    validate_tsv "$file" "$HED_VERSION"
done

echo "Dataset validation complete!"
```

## Development

### Project structure

```
src/
├── server.ts              # Main MCP server (stdio/WebSocket)
├── tools/                 # MCP tools (validation functions)
│   ├── validateHedString.ts
│   ├── validateHedTsv.ts
│   ├── validateHedSidecar.ts
│   └── getFileFromPath.ts
├── resources/             # MCP resources (schema info)
│   └── hedSchema.ts
├── utils/                 # Utility functions
│   ├── mcpToZod.ts
│   ├── definitionProcessor.ts
│   ├── fileReader.ts
│   ├── issueFormatter.ts
│   └── schemaCache.ts
└── types/                 # TypeScript type definitions
    └── index.ts
```

### Available scripts

```bash
npm run build        # Build the TypeScript project
npm run dev          # Build in watch mode
npm run test         # Run the test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
npm run clean        # Clean build artifacts
npm start           # Run stdio MCP server
npm run start:http  # Run HTTP API server
```

### Development Workflow

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd hed-mcp-typescript
   npm install
   ```

2. **Start development**:
   ```bash
   npm run dev  # Builds in watch mode
   ```

3. **Test your changes**:
   ```bash
   npm test
   ```

4. **Test with inspector**:
   ```bash
   npx @modelcontextprotocol/inspector node dist/server.js
   ```

## Troubleshooting

### Common issues

#### Issue: Server won't start

**Symptoms**: Server exits immediately or shows connection errors

**Solutions**:
1. Check Node.js version (requires 18+)
2. Verify build completed successfully: `npm run build`
3. Check for port conflicts
4. Review error messages in console

#### Issue: Schema loading failures

**Symptoms**: `SCHEMA_LOAD_FAILED` errors

**Solutions**:
1. Verify internet connectivity for schema downloads
2. Use exact schema version strings
3. Check schema cache directory permissions
4. Try clearing cache: delete node_modules and reinstall

#### Issue: File reading errors

**Symptoms**: `FILE_READ_ERROR` when accessing files

**Solutions**:
1. Verify file paths are absolute
2. Check file permissions and existence
3. Use inline data (`fileData`) for testing
4. Ensure proper file encoding (UTF-8)

#### Issue: Validation inconsistencies

**Symptoms**: Different results from same input

**Solutions**:
1. Ensure consistent schema versions
2. Clear schema cache if needed
3. Check for concurrent validation conflicts
4. Verify definition ordering and consistency

### Performance issues

#### Memory usage

- Monitor memory usage with large datasets
- Process files in batches if memory constrained
- Clear unused schema cache entries
- Use streaming for very large files

#### Speed optimization

- Reuse server connections for multiple operations
- Cache schemas and definitions between operations
- Use inline data to avoid file I/O overhead
- Disable warnings for production validation

## API documentation

For detailed API documentation, see [API.md](./API.md).

Key concepts:

- **FormattedIssue**: Standardized error/warning format
- **HedValidationResult**: Standard validation response format
- **Schema Caching**: Automatic caching of loaded HED schemas
- **Definition Support**: Process and use HED definitions during validation

## Testing

The project includes comprehensive tests covering:

- **Unit tests**: Individual function testing
- **Integration tests**: Tool interaction testing
- **Data validation**: Real HED data file testing

### Run tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode during development
npm run test:watch

# Run only integration tests
npm test -- --testPathPattern=integration
```

### Test data

Test files are located in `tests/data/`:
- `sub-002_ses-1_task-FacePerception_run-1_events.tsv`
- `task-FacePerception_events.json`
- `participants_bad.json`
- `participants_bad.tsv`

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run the test suite**: `npm test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Ensure all tests pass before submitting

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Related projects

- [HED Specification](https://hed-specification.readthedocs.io/)
- [HED JavaScript Library](https://github.com/hed-standard/hed-javascript)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [BIDS Specification](https://bids-specification.readthedocs.io/)
- [Browser-based HED validator](https://www.hedtags.org/hed-web)

## 📞 Support

- [Issues](https://github.com/hed-standard/hed-mcp/issues)
- [HED homepage](https://github.com/hed-standard)
- [Documentation](https://www.hedtags.org/hed-resources)
- [Discussion](https://github.com/orgs/hed-standard/discussions)
