const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL/g, '"https://13-207-203-76.nip.io"');
            fs.writeFileSync(fullPath, content);
        }
    }
}

replaceInDir(path.join(__dirname, 'src'));
console.log('Replaced all API URLs');
