/**
 * Example of how to use the definition processor utilities
 * This demonstrates the correct usage of the HED MCP server's definition processing capabilities.
 */

import { convertDefinitions, createDefinitionManager } from '../src/utils/definitionProcessor.js';
import { buildSchemasFromVersion } from 'hed-validator';

async function exampleUsage() {
  console.log('=== HED Definition Processing Example ===\n');
  
  // Load HED schemas
  console.log('Loading HED schemas (version 8.4.0)...');
  const hedSchemas = await buildSchemasFromVersion('8.4.0');
  console.log('✅ Schemas loaded successfully\n');
  
  // Example definition strings
  const definitionStrings = [
    '(Definition/RedCircle, (Event/Sensory-event, (Red, Circle)))',
    '(Definition/ButtonPress, (Action/Move, (Press, Mouse-button)))',
    '(Definition/FixationCross, (Event/Sensory-event, Visual-presentation, (Image, Cross)))',
    '(Definition/InvalidDef, Red)' // This will cause an error - missing proper structure
  ];
  
  console.log('Definition strings to process:');
  definitionStrings.forEach((def, i) => {
    console.log(`  ${i + 1}. ${def}`);
  });
  console.log();

  // Example 1: Using convertDefinitions directly
  console.log('--- Example 1: Using convertDefinitions ---');
  const convertResult = convertDefinitions(definitionStrings, hedSchemas);
  
  console.log('Convert result:', {
    definitionsCreated: convertResult.definitions.length,
    errorCount: convertResult.errors.length,
    warningCount: convertResult.warnings.length
  });
  
  if (convertResult.errors.length > 0) {
    console.log('\nErrors during conversion:');
    convertResult.errors.forEach(error => {
      console.log(`  ❌ ${error.message}`);
    });
  }
  
  if (convertResult.warnings.length > 0) {
    console.log('\nWarnings during conversion:');
    convertResult.warnings.forEach(warning => {
      console.log(`  ⚠️ ${warning.message}`);
    });
  }
  
  if (convertResult.definitions.length > 0) {
    console.log(`\nSuccessfully created ${convertResult.definitions.length} definition(s)`);
  }
  console.log();

  // Example 2: Using createDefinitionManager (recommended approach)
  console.log('--- Example 2: Using createDefinitionManager ---');
  const managerResult = createDefinitionManager(definitionStrings, hedSchemas);
  
  console.log('Manager creation result:', {
    hasManager: managerResult.definitionManager !== null,
    errorCount: managerResult.errors.length,
    warningCount: managerResult.warnings.length
  });
  
  if (managerResult.errors.length > 0) {
    console.log('\nErrors during manager creation:');
    managerResult.errors.forEach(error => {
      console.log(`  ❌ ${error.message} (${error.code})`);
    });
  }
  
  if (managerResult.warnings.length > 0) {
    console.log('\nWarnings during manager creation:');
    managerResult.warnings.forEach(warning => {
      console.log(`  ⚠️ ${warning.message} (${warning.code})`);
    });
  }
  
  if (managerResult.definitionManager) {
    console.log('\n✅ DefinitionManager created successfully!');
    console.log(`Number of definitions in manager: ${managerResult.definitionManager.definitions.size}`);
    
    console.log('\nDefinitions in manager:');
    const definitionsArray = Array.from(managerResult.definitionManager.definitions.entries());
    definitionsArray.forEach(([name, definition]) => {
      console.log(`  - ${name}`);
    });
  } else {
    console.log('\n❌ Failed to create DefinitionManager (likely due to errors)');
  }
  
  // Example 3: Processing only valid definitions
  console.log('\n--- Example 3: Processing Only Valid Definitions ---');
  const validDefinitionStrings = [
    '(Definition/RedCircle, (Event/Sensory-event, (Red, Circle)))',
    '(Definition/ButtonPress, (Action/Move, (Press, Mouse-button)))',
    '(Definition/FixationCross, (Event/Sensory-event, Visual-presentation, (Image, Cross)))'
  ];
  
  const validManagerResult = createDefinitionManager(validDefinitionStrings, hedSchemas);
  
  console.log('Valid definitions result:', {
    hasManager: validManagerResult.definitionManager !== null,
    errorCount: validManagerResult.errors.length,
    warningCount: validManagerResult.warnings.length,
    definitionCount: validManagerResult.definitionManager?.definitions.size || 0
  });
  
  if (validManagerResult.definitionManager) {
    console.log('\n✅ All definitions processed successfully!');
    
    // Demonstrate how this would be used in the MCP server
    console.log('\n--- Example: How this integrates with MCP validation ---');
    console.log('This DefinitionManager can now be used in HED validation calls:');
    console.log('- validateHedString with definitions parameter');
    console.log('- validateHedTsv with definitions parameter');
    console.log('- validateHedSidecar with definitions parameter');
  }
  
  console.log('\n=== Example Complete ===');
}

// Only run if this file is executed directly
// Check if running directly (works in both CommonJS and ES modules)
if (typeof require !== 'undefined' && require.main === module) {
  exampleUsage().catch(console.error);
}

export { exampleUsage };
