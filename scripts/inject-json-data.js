#!/usr/bin/env node

/**
 * Script to inject JSON data into sampleData.ts
 *
 * Usage: node scripts/inject-json-data.js <json-file-path>
 * Example: node scripts/inject-json-data.js src/data/fairfax-county.json
 *
 * This script reads a jurisdiction JSON file and updates the corresponding
 * exports in sampleData.ts based on the jurisdiction ID.
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_DATA_PATH = path.join(__dirname, '../src/data/sampleData.ts');

function formatValue(value, indent = 0) {
  const spaces = '  '.repeat(indent);

  if (value === null || value === undefined) {
    return 'undefined';
  }

  if (typeof value === 'string') {
    // Use single quotes and escape any single quotes in the string
    return `'${value.replace(/'/g, "\\'")}'`;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';

    // Check if it's an array of primitives (like constraints)
    if (value.every(item => typeof item === 'string')) {
      const items = value.map(item => `${spaces}    '${item.replace(/'/g, "\\'")}'`).join(',\n');
      return `[\n${items},\n${spaces}  ]`;
    }

    // Array of objects
    const items = value.map(item => `${spaces}  ${formatValue(item, indent + 1)}`).join(',\n');
    return `[\n${items},\n${spaces}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return '{}';

    const formattedEntries = entries.map(([key, val]) => {
      // Handle keys that might need quotes
      const formattedKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : `'${key}'`;
      return `${spaces}  ${formattedKey}: ${formatValue(val, indent + 1)}`;
    }).join(',\n');

    return `{\n${formattedEntries},\n${spaces}}`;
  }

  return String(value);
}

function generateJurisdictionExport(data, varName) {
  return `export const ${varName}: Jurisdiction = ${formatValue(data)};`;
}

function generateCategoriesExport(categories, varName) {
  const items = categories.map(cat => `  ${formatValue(cat, 1)}`).join(',\n');
  return `export const ${varName}: BudgetCategory[] = [\n${items},\n];`;
}

function generateRevenueExport(sources, varName) {
  const items = sources.map(src => `  ${formatValue(src, 1)}`).join(',\n');
  return `export const ${varName}: RevenueSource[] = [\n${items},\n];`;
}

function generateResidentExport(profile, varName) {
  return `export const ${varName}: ResidentProfile = ${formatValue(profile)};`;
}

function getVariableNames(jurisdictionId) {
  // Map jurisdiction IDs to their variable names in sampleData.ts
  const mappings = {
    'fairfax-county': {
      jurisdiction: 'sampleCounty',
      categories: 'countyBudgetCategories',
      revenue: 'countyRevenueSources',
      resident: 'averageCountyResident',
    },
    'liberty-township': {
      jurisdiction: 'sampleTownship',
      categories: 'townshipBudgetCategories',
      revenue: 'townshipRevenueSources',
      resident: 'averageTownshipResident',
    },
    'riverside-city': {
      jurisdiction: 'sampleCity',
      categories: 'cityBudgetCategories',
      revenue: 'cityRevenueSources',
      resident: 'averageCityResident',
    },
  };

  return mappings[jurisdictionId];
}

function replaceExport(content, exportPattern, newExport) {
  // Match the export statement including any preceding comments
  const regex = new RegExp(
    `(// [^\n]*\n)?export const ${exportPattern}[^=]*=[^;]*(?:\\{[^}]*(?:\\{[^}]*\\}[^}]*)*\\}|\\[[^\\]]*(?:\\[[^\\]]*\\][^\\]]*)*\\]);`,
    's'
  );

  // If not found with simple regex, try a more robust approach
  if (!regex.test(content)) {
    // Find the start of the export
    const startPattern = new RegExp(`export const ${exportPattern}`);
    const match = content.match(startPattern);

    if (match) {
      const startIndex = match.index;
      let depth = 0;
      let inString = false;
      let stringChar = '';
      let endIndex = startIndex;

      for (let i = startIndex; i < content.length; i++) {
        const char = content[i];
        const prevChar = i > 0 ? content[i - 1] : '';

        if (!inString) {
          if (char === '"' || char === "'" || char === '`') {
            inString = true;
            stringChar = char;
          } else if (char === '{' || char === '[') {
            depth++;
          } else if (char === '}' || char === ']') {
            depth--;
          } else if (char === ';' && depth === 0) {
            endIndex = i + 1;
            break;
          }
        } else {
          if (char === stringChar && prevChar !== '\\') {
            inString = false;
          }
        }
      }

      // Check for preceding comment
      let commentStart = startIndex;
      const prevLines = content.substring(0, startIndex).split('\n');
      const lastLine = prevLines[prevLines.length - 1];
      if (lastLine.trim() === '') {
        const secondLastLine = prevLines[prevLines.length - 2];
        if (secondLastLine && secondLastLine.trim().startsWith('//')) {
          commentStart = startIndex - lastLine.length - secondLastLine.length - 1;
        }
      }

      return content.substring(0, commentStart) + newExport + content.substring(endIndex);
    }
  }

  return content.replace(regex, newExport);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node scripts/inject-json-data.js <json-file-path>');
    console.error('Example: node scripts/inject-json-data.js src/data/fairfax-county.json');
    process.exit(1);
  }

  const jsonFilePath = path.resolve(args[0]);

  // Read the JSON file
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`Error: JSON file not found: ${jsonFilePath}`);
    process.exit(1);
  }

  console.log(`Reading JSON from: ${jsonFilePath}`);
  const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');
  const data = JSON.parse(jsonContent);

  // Validate the JSON structure
  if (!data.jurisdiction || !data.jurisdiction.id) {
    console.error('Error: JSON must contain a "jurisdiction" object with an "id" field');
    process.exit(1);
  }

  const jurisdictionId = data.jurisdiction.id;
  const varNames = getVariableNames(jurisdictionId);

  if (!varNames) {
    console.error(`Error: Unknown jurisdiction ID: ${jurisdictionId}`);
    console.error('Supported IDs: fairfax-county, liberty-township, riverside-city');
    process.exit(1);
  }

  console.log(`Updating data for jurisdiction: ${data.jurisdiction.name} (${jurisdictionId})`);

  // Read the current sampleData.ts
  if (!fs.existsSync(SAMPLE_DATA_PATH)) {
    console.error(`Error: sampleData.ts not found at: ${SAMPLE_DATA_PATH}`);
    process.exit(1);
  }

  let sampleDataContent = fs.readFileSync(SAMPLE_DATA_PATH, 'utf-8');

  // Generate new exports
  const newJurisdiction = generateJurisdictionExport(data.jurisdiction, varNames.jurisdiction);
  const newCategories = generateCategoriesExport(data.budgetCategories, varNames.categories);
  const newRevenue = generateRevenueExport(data.revenueSources, varNames.revenue);

  // Replace each export in the file
  console.log(`Replacing ${varNames.jurisdiction}...`);
  sampleDataContent = replaceExport(sampleDataContent, varNames.jurisdiction, newJurisdiction);

  console.log(`Replacing ${varNames.categories}...`);
  sampleDataContent = replaceExport(sampleDataContent, varNames.categories, newCategories);

  console.log(`Replacing ${varNames.revenue}...`);
  sampleDataContent = replaceExport(sampleDataContent, varNames.revenue, newRevenue);

  // Only update resident profile if provided in JSON
  if (data.averageResident) {
    console.log(`Replacing ${varNames.resident}...`);
    const newResident = generateResidentExport(data.averageResident, varNames.resident);
    sampleDataContent = replaceExport(sampleDataContent, varNames.resident, newResident);
  }

  // Write the updated file
  fs.writeFileSync(SAMPLE_DATA_PATH, sampleDataContent);
  console.log(`\nSuccessfully updated ${SAMPLE_DATA_PATH}`);
  console.log('\nUpdated exports:');
  console.log(`  - ${varNames.jurisdiction}`);
  console.log(`  - ${varNames.categories}`);
  console.log(`  - ${varNames.revenue}`);
  if (data.averageResident) {
    console.log(`  - ${varNames.resident}`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
