const fs = require('fs');
const path = require('path');

const srcDirs = [
    path.join(__dirname, 'app'),
    path.join(__dirname, 'modules'),
    path.join(__dirname, 'shared')
];

function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fn = path.join(dir, file);
        if (fs.statSync(fn).isDirectory()) {
            walk(fn, callback);
        } else {
            if (fn.endsWith('.tsx') || fn.endsWith('.ts')) {
                callback(fn);
            }
        }
    }
}

let modifiedCount = 0;

srcDirs.forEach(dir => {
    walk(dir, (filename) => {
        let content = fs.readFileSync(filename, 'utf8');
        let modified = false;

        // 1. Rename Table to LegacyTable import
        if (content.includes('@/shared/components/ui/Table')) {
            content = content.replace(/import\s+Table\s+from\s+["']@\/shared\/components\/ui\/Table["']/g, 'import LegacyTable from "@/shared/components/ui/LegacyTable"');
            content = content.replace(/import\s+\{\s*Table\s*\}\s+from\s+["']@\/shared\/components\/ui\/Table["']/g, 'import { LegacyTable } from "@/shared/components/ui/LegacyTable"');
            content = content.replace(/<Table\b/g, '<LegacyTable');
            content = content.replace(/<\/Table>/g, '</LegacyTable>');
            modified = true;
        }

        // 2. Change @/components/ui -> @/shared/components/ui
        if (content.includes('@/components/ui/')) {
            content = content.replace(/@\/components\/ui\//g, '@/shared/components/ui/');
            modified = true;
        }

        // 3. Update relative imports that used components/ui
        // Some components like those inside components/ui might have been importing each other like "../ui/something"
        // Since they will move, they might be in the same folder now "./something", but we'll see if that's an issue.
        // Given the target is changing, usually tsconfig paths are better. We just replaced `@/components/ui` above.

        if (modified) {
            fs.writeFileSync(filename, content);
            modifiedCount++;
            console.log(`Updated ${filename}`);
        }
    });
});

console.log(`Finished updating ${modifiedCount} files.`);
