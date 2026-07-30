const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findAndReplaceFiles(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            findAndReplaceFiles(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Simple check to avoid modifying the apiClient.js itself
            if (file === 'apiClient.js' || file === 'apiConfig.js') continue;

            // 1. Check if the file contains the target fetch string
            if (content.includes('http://localhost:3000')) {
                // 2. Add the import statement if not already present
                if (!content.includes('import { apiFetch }')) {
                    // Calculate relative path to apiClient.js
                    const relativePath = path.relative(path.dirname(filePath), path.join(srcDir, 'apiClient')).replace(/\\/g, '/');
                    const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
                    
                    // Insert after the last import, or at the top
                    const lines = content.split('\n');
                    let lastImportIndex = -1;
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].startsWith('import ')) {
                            lastImportIndex = i;
                        }
                    }
                    
                    const importStatement = `import { apiFetch } from '${importPath}';`;
                    if (lastImportIndex !== -1) {
                        lines.splice(lastImportIndex + 1, 0, importStatement);
                    } else {
                        lines.unshift(importStatement);
                    }
                    content = lines.join('\n');
                }

                // 3. Replace fetch(`http://localhost:3000/...) with apiFetch(`/...`)
                // Handle template literals and normal strings
                content = content.replace(/fetch\(\s*[`'"]http:\/\/localhost:3000(\/.*?[`'"])\s*(?:,\s*\{[\s\S]*?\})?\)/g, (match, endpoint) => {
                    return match.replace(/fetch/, 'apiFetch').replace(/http:\/\/localhost:3000/, '');
                });

                // Write back
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated ${filePath}`);
            }
        }
    }
}

findAndReplaceFiles(srcDir);
console.log('Done refactoring API calls.');
