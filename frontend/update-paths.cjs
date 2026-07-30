const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const exts = ['.jsx', '.js', '.css'];

const imageNames = [
    'buttercup', 'gwen', 'henry', 'spidey', 'bheek', 'color-fire', 'killua', 'lokind', 'msg'
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const name of imageNames) {
        // Regex to match /filename.png, filename.jpg etc.
        const regex = new RegExp(`(${name})\\.(png|jpg|jpeg)`, 'gi');
        content = content.replace(regex, `$1.webp`);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (exts.includes(path.extname(file))) {
            replaceInFile(filePath);
        }
    }
}

processDirectory(srcDir);
console.log("Replacement complete.");
