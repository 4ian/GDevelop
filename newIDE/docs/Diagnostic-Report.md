# Diagnostic Report

The Diagnostic Report is a tool that helps developers identify and fix issues in their GDevelop projects before previewing or exporting.

## Opening the Diagnostic Report

Press **F7** to open the Diagnostic Report dialog at any time when a project is open.

You can also access it via the Command Palette (Ctrl+P or Cmd+P) by searching for "Show diagnostic report".

## Features

### 1. Missing Actions/Conditions/Expressions

The report detects instructions that reference actions, conditions, or expressions that no longer exist. This typically happens when:

- An extension's API has changed (instructions were renamed or removed)
- An extension was updated to a newer version with breaking changes

Each missing instruction is grouped by extension name and shows:
- The extension name
- The list of missing instructions
- The location(s) where they are used (clickable to navigate)

### 2. Invalid Parameters in Events

The report scans all events in your project for invalid parameters, which are shown with a red underline in the Events Sheet. Features include:

- **Location column**: Shows scene or external events name
- **Instruction column**: Shows the instruction with **Action** or **Condition** in bold at the beginning
- **Text truncation**: Long instructions are truncated with "..." at the end
- **Expand/Collapse**: Click on the instruction text or the arrow button to see the full text (button only appears when text is truncated)
- **Navigation**: Click on the location link to navigate directly to the event in the Events Sheet

### 3. Native Diagnostic Report

Additional diagnostics from the C++ core, including:
- Missing objects
- Objects used with wrong actions or conditions
- Missing scene variables
- Missing object variables
- Missing behaviors

## Preferences

### Generate report at each preview

When enabled, the diagnostic report will automatically open after each preview if issues are found.

**Location**: Preferences → Preview → "Automatically open the diagnostic report at preview"

**Default**: Enabled

### Block preview and export on diagnostic errors

When enabled, the editor will prevent launching previews or exports if diagnostic errors are found. An alert will be shown with the number of errors and a reminder to press F7 to view the report.

**Location**: Preferences → Preview → "Block preview and export when diagnostic errors are found"

**Default**: Disabled

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Diagnostic Report | F7 |

## Event Navigation

When clicking on a location in the diagnostic report:

1. The dialog closes
2. The corresponding Events Sheet (layout or external events) opens
3. The event is automatically scrolled into view
4. The event is highlighted for 3 seconds (similar to search results)

## Technical Details

The diagnostic scanning is performed by `EventsValidationScanner.js`, which:

1. Iterates through all layouts and external events
2. Scans each event and its sub-events recursively
3. Checks each instruction for:
   - Missing metadata (instruction type doesn't exist)
   - Invalid parameters (using `gd.InstructionValidator.isParameterValid`)
4. Stores the event path for navigation purposes

### Event Path

Each error stores an `eventPath` array representing the path from the root events list to the specific event. For example, `[2, 0, 1]` means:
- Event at index 2 in the root list
- Sub-event at index 0
- Sub-event at index 1

This allows precise navigation to nested events.

