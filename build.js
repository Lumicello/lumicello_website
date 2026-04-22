/**
 * Lumicello Website Build Script
 *
 * Copies only public files to the dist/ folder for deployment.
 * Excludes sensitive documentation, config files, and internal docs.
 *
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DIST_DIR = 'dist';

// Files and folders to include (whitelist approach for security)
const PUBLIC_FILES = [
    'index.html',
    'lumibox.html',
    'contact.html',
    'privacy.html',
    'terms.html',
    'voucher-terms.html',
    '404.html',
    'coming-soon.html',
    'careers.html',
    'welcome.html',
    'big-garden.html',
    'ai-info.html',
    'robots.txt',
    'sitemap.xml',
    'llms.txt',
    'favicon.ico',
    'favicon.png',
    'favicon-192.png',
    'apple-touch-icon.png',
    'svg_favicon.svg'
];

const PUBLIC_FOLDERS = [
    'css',
    'js',
    'assets',
    'voucher-terms'
];

/**
 * Recursively copy a directory
 */
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Clean and create dist directory
 */
function cleanDist() {
    if (fs.existsSync(DIST_DIR)) {
        fs.rmSync(DIST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(DIST_DIR);
}

/**
 * Main build function
 */
function build() {
    console.log('🚀 Building Lumicello website for deployment...\n');

    // Clean dist folder
    console.log('📁 Cleaning dist/ folder...');
    cleanDist();

    // Copy public files
    console.log('📄 Copying public files...');
    for (const file of PUBLIC_FILES) {
        if (fs.existsSync(file)) {
            fs.copyFileSync(file, path.join(DIST_DIR, file));
            console.log(`   ✓ ${file}`);
        } else {
            console.log(`   ⚠ ${file} (not found, skipping)`);
        }
    }

    // Copy public folders
    console.log('\n📂 Copying public folders...');
    for (const folder of PUBLIC_FOLDERS) {
        if (fs.existsSync(folder)) {
            copyDir(folder, path.join(DIST_DIR, folder));
            console.log(`   ✓ ${folder}/`);
        } else {
            console.log(`   ⚠ ${folder}/ (not found, skipping)`);
        }
    }

    // Summary
    console.log('\n✅ Build complete!');
    console.log(`   Output: ./${DIST_DIR}/`);
    console.log('\n📋 Files NOT included (protected):');
    console.log('   - *.md files (CLAUDE.md, QA_CHECKLIST.md, etc.)');
    console.log('   - design_specs/ folder');
    console.log('   - render.yaml, _redirects');
    console.log('   - .gitignore, .git/, .playwright-mcp/');
    console.log('\n🔧 Configure Render.com:');
    console.log('   Build Command: node build.js');
    console.log('   Publish Directory: dist');
}

// Run build
build();
