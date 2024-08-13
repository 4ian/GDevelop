const path = require('path');
const fs = require('fs');

const gdVersion = require('../../newIDE/electron-app/app/package.json').version;
const gdVersionArray = gdVersion.split('.');
const versionPrivContent = 
`// This file is automatically synchronizing with newIDE/electron-app/app/package.json version
// Check GDevelop/scripts/sync-versions.js for more details
#define GD_VERSION_STRING "${gdVersion}-0-release"
#define GD_VERSION_RC ${gdVersionArray.join(',')},0-0-release
#define GD_VERSION_RC_STRING "${gdVersionArray.join(', ')}, 0-0-release\\0"
#define GD_DATE_STRING __DATE__
`;

fs.writeFileSync(path.join(__dirname, "../../Core/GDCore/Tools/VersionPriv.h"), versionPrivContent, "utf8");