const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, 'public');

async function convertImages(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            await convertImages(filePath);
        } else if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            const webpPath = path.join(dir, `${baseName}.webp`);
            
            console.log(`Converting ${filePath} to ${webpPath}`);
            try {
                await sharp(filePath)
                    .webp({ quality: 80 })
                    .toFile(webpPath);
                
                // Remove original file after successful conversion
                fs.unlinkSync(filePath);
                console.log(`Deleted original file: ${filePath}`);
            } catch (err) {
                console.error(`Error converting ${filePath}:`, err);
            }
        }
    }
}

convertImages(publicDir).then(() => {
    console.log('Conversion complete.');
});
