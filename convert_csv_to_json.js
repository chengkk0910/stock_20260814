const fs = require('fs');
const path = require('path');

function parseValue(val) {
  if (val === null || val === undefined) return null;
  val = val.trim();
  if (val === '') return null;
  if (!isNaN(val) && val !== '') {
    if (val.length > 1 && val.startsWith('0') && !val.startsWith('0.')) {
      return val;
    }
    return Number(val);
  }
  return val;
}

function parseCSV(content) {
  // Remove BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = parseValue(values[idx]);
    });
    result.push(obj);
  }
  return result;
}

function convertFile(csvPath) {
  const jsonPath = csvPath.replace(/\.csv$/i, '.json');
  const content = fs.readFileSync(csvPath, 'utf8');
  const data = parseCSV(content);
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Converted: ${csvPath} -> ${jsonPath} (${data.length} records)`);
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.csv')) {
      convertFile(fullPath);
    }
  }
}

const target = process.argv[2] || '.';
if (fs.existsSync(target)) {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    convertFile(target);
  } else if (stat.isDirectory()) {
    walkDir(target);
  }
} else {
  console.log(`Target path '${target}' does not exist.`);
}
