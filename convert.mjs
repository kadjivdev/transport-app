import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function convertFiles(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory() && !file.name.includes('node_modules') && !file.name.includes('.git')) {
            convertFiles(fullPath);
        } else if (file.isFile()) {
            if (file.name.endsWith('.tsx')) {
                const newPath = fullPath.replace(/\.tsx$/, '.jsx');
                fs.renameSync(fullPath, newPath);
                console.log(`✅ ${file.name} → ${path.basename(newPath)}`);
            } else if (file.name.endsWith('.ts') && !file.name.includes('tsconfig')) {
                const newPath = fullPath.replace(/\.ts$/, '.js');
                fs.renameSync(fullPath, newPath);
                console.log(`✅ ${file.name} → ${path.basename(newPath)}`);
            }
        }
    });
}

function updateImports(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory() && !file.name.includes('node_modules') && !file.name.includes('.git')) {
            updateImports(fullPath);
        } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.jsx'))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            content = content.replace(/from\s+['"]([^'"]+)\.tsx['"]/g, 'from "$1.jsx"');
            content = content.replace(/from\s+['"]([^'"]+)\.ts['"]/g, 'from "$1.js"');
            
            fs.writeFileSync(fullPath, content, 'utf8');
        }
    });
}

console.log('🔄 Conversion TypeScript → JavaScript...\n');

// Renommer vite.config.ts
if (fs.existsSync('vite.config.ts')) {
    fs.renameSync('vite.config.ts', 'vite.config.js');
    console.log('✅ vite.config.ts → vite.config.js');
}

// Renommer tous les fichiers
console.log('\n📝 Renommage des fichiers:');
convertFiles('src');

// Mettre à jour les imports
console.log('\n🧹 Mise à jour des imports...');
updateImports('src');

console.log('\n✨ Conversion terminée !');
