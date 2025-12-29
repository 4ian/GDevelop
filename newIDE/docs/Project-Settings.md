# Project-specific Settings

GDevelop supports project-specific editor settings through a `settings.ini` file. When a project is opened, the editor reads this file and applies the settings to override user preferences.

## Usage

Place a `settings.ini` file in your project's root directory (same level as the main project `.json` file).

```
my-project/
├── game.json
├── settings.ini    <-- Place settings file here
├── assets/
└── ...
```

## File Format

The file uses standard INI format:

```ini
; This is a comment
# This is also a comment

autosaveOnPreview = true
use3DEditor = false
showDeprecatedInstructionWarning = true
```

### Sections (Optional)

You can optionally organize settings into sections for readability:

```ini
[Previews]
autosaveOnPreview = true
takeScreenshotOnPreview = false

[SceneEditor]
use3DEditor = true
showBasicProfilingCounters = false
```

### Boolean Values

Settings accept boolean values in these formats:
- `true`, `false`
- `yes`, `no` (parsed as strings, not recommended)
- `1`, `0` (parsed as strings, not recommended)

**Recommended:** Use `true` or `false` for clarity.

## Available Settings

### At Launch

| Key | Description |
|-----|-------------|
| `showCreateSectionByDefault` | Show the "Create" section by default when opening GDevelop |
| `autoOpenMostRecentProject` | Automatically re-open the project edited during last session |

### Previews

| Key | Description |
|-----|-------------|
| `autosaveOnPreview` | Auto-save project on preview |
| `fetchPlayerTokenForPreviewAutomatically` | Automatically log in as a player in preview |
| `openDiagnosticReportAutomatically` | Automatically open the diagnostic report at preview |
| `sendCrashReports` | Send crash reports during previews to GDevelop |
| `takeScreenshotOnPreview` | Automatically take a screenshot in game previews |
| `isMenuBarHiddenInPreview` | Hide the menu bar in the preview window (Electron only) |
| `isAlwaysOnTopInPreview` | Always display the preview window on top of the editor (Electron only) |
| `useShortcutToClosePreviewWindow` | Enable "Close project" shortcut to close preview window (Electron only) |

### Scene Editor

| Key | Description |
|-----|-------------|
| `showBasicProfilingCounters` | Display profiling information in scene editor |
| `use3DEditor` | Show objects in 3D in the scene editor |

### Other

| Key | Description |
|-----|-------------|
| `showAiAskButtonInTitleBar` | Show "Ask AI" button in the title bar |
| `automaticallyUseCreditsForAiRequests` | Automatically use GDevelop credits for AI requests when run out of AI credits |
| `displaySaveReminder` | Display save reminder after significant changes in project |
| `showExperimentalExtensions` | Show experimental extensions in the list of extensions |
| `showDeprecatedInstructionWarning` | Show a warning on deprecated actions and conditions |
| `watchProjectFolderFilesForLocalProjects` | Watch the project folder for file changes (Electron only) |

### Contributor Options

| Key | Description |
|-----|-------------|
| `showInAppTutorialDeveloperMode` | Show button to load guided lesson from file and test it |

### Developer Options

| Key | Description |
|-----|-------------|
| `useGDJSDevelopmentWatcher` | Watch changes in game engine (GDJS) sources and auto import them (dev only) |

## Example: Full settings.ini

```ini
; GDevelop Project Settings
; Disable features not needed for this project

[Previews]
autosaveOnPreview = true
fetchPlayerTokenForPreviewAutomatically = false
openDiagnosticReportAutomatically = false
sendCrashReports = true
takeScreenshotOnPreview = true
isMenuBarHiddenInPreview = true
isAlwaysOnTopInPreview = false

[SceneEditor]
showBasicProfilingCounters = false
use3DEditor = true

[Other]
showDeprecatedInstructionWarning = true
showExperimentalExtensions = false
displaySaveReminder = true
```

## Example: Minimal settings.ini

```ini
; Enable deprecated warnings for this legacy project
showDeprecatedInstructionWarning = true
```

## Notes

- Settings are applied when the project is opened
- Only boolean settings are supported
- Unknown keys are logged as warnings in the console
- This feature only works in the Electron (desktop) version of GDevelop
- Settings in `settings.ini` override user preferences but don't persist them permanently

