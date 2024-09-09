const path = require('path');
const fs = require('fs');

// Get the version details from the package.json
const [
  gdVersion,
  prerelease,
] = require('../../newIDE/electron-app/app/package.json').version.split('-');

const versionPrivContent = `// This file is automatically synchronizing with newIDE/electron-app/app/package.json version
// Check GDevelop/scripts/sync-versions.js for more details
#define GD_VERSION_STRING "${gdVersion}-${prerelease || 0}"
`;

const filePath = path.join(__dirname, '../../Core/GDCore/Tools/VersionPriv.h');

let currentContent;
try {
  currentContent = fs.readFileSync(filePath, 'utf8');
} catch (error) {
  if (error.code === 'ENOENT') {
    // VersionPriv.h does not exist, will be created.
  } else {
    console.log('❌ Error reading VersionPriv.h file');
    throw error; // Rethrow error if not a 'file not found' error
  }
}

// Write to the file only if the content has changed to avoid unnecessary recompilation of C++ files.
if (currentContent !== versionPrivContent) {
  fs.writeFileSync(filePath, versionPrivContent, 'utf8');
  console.log('✅ VersionPriv.h updated with the version number.');
} else {
  console.log('ℹ️ VersionPriv.h is up to date.');
}
