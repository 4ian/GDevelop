const path = require('path');
const fs = require('fs');

const [gdVersion, prerelease] = require('../../newIDE/electron-app/app/package.json').version.split('-');
const versionPrivContent = 
`// This file is automatically synchronizing with newIDE/electron-app/app/package.json version
// Check GDevelop/scripts/sync-versions.js for more details
#define GD_VERSION_STRING "${gdVersion}-${prerelease || 0}"
`;

fs.writeFileSync(path.join(__dirname, "../../Core/GDCore/Tools/VersionPriv.h"), versionPrivContent, "utf8");