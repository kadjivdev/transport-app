#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function convertFiles(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory() && !file.name.includes('node_modules')) {
            convertFiles(fullPath);
        } else if (file.isFile()) {
            if (file.name.endsWith('.tsx')) {
                const newPath = fullPath.replace(/\.tsx$/, '.jsx');
                fs.renameSync(fullPath, newPath);
                console.log(`✅ Renommé: ${file.name} → ${path.basename(newPath)}`);
            } else if (file.name.endsWith('.ts')) {
                const newPath = fullPath.replace(/\.ts$/, '.js');
                fs.renameSync(fullPath, newPath);
                console.log(`✅ Renommé: ${file.name} → ${path.basename(newPath)}`);
            }
        }
    });
}

function updateImports(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory() && !file.name.includes('node_modules')) {
            updateImports(fullPath);
        } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.jsx'))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Remplacer les extensions dans les imports
            content = content.replace(/from\s+['"]([^'"]*\.tsx)['"]/g, 'from "$1"'.replace('.tsx', '.jsx'));
            content = content.replace(/from\s+['"]([^'"]*\.ts)['"]/g, 'from "$1"'.replace('.ts', '.js'));
            
            // Meilleure approche avec regex
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
    console.log('✅ Renommé: vite.config.ts → vite.config.js');
}

// Renommer tous les fichiers
convertFiles('src');

// Mettre à jour les imports
console.log('\n🧹 Mise à jour des imports...');
updateImports('src');

// Nettoyer les fichiers vite.config.js
if (fs.existsSync('vite.config.js')) {
    let config = fs.readFileSync('vite.config.js', 'utf8');
    config = config.replace(/import\s+type\s+/g, 'import ');
    config = config.replace(/:\s*(?:string|number|boolean|any|void|ReactNode|JSX\.Element)\b/g, '');
    fs.writeFileSync('vite.config.js', config, 'utf8');
    console.log('✅ Nettoyé: vite.config.js');
}

console.log('\n✨ Conversion terminée !');
console.log('📝 Prochaines étapes:');
console.log('   1. Vérifier les erreurs de type');
console.log('   2. Redémarrer npm dev');
console.log('   3. Supprimer les fichiers tsconfig.json');
