# Test Initialize Project Command

## Summary of Changes

### 1. Added `initialize_project` function to EditorFunctions/index.js
- Takes `name` and `example_slug` as arguments
- Returns a special response that signals project initialization is needed

### 2. Updated EditorCallbacks type
- Added optional `onCreateProjectFromExample` callback

### 3. Modified EditorFunctionCallRunner
- Handles the special case when `_requiresProjectInitialization` is true
- Calls the `onCreateProjectFromExample` callback with the project name and example slug

### 4. Updated AskAiEditorContainer
- Removed automatic project creation when no project is open
- Added implementation of `onCreateProjectFromExample` callback that:
  - Fetches all examples to find the one matching the slug
  - Creates appropriate project setup
  - Calls the main `onCreateProjectFromExample` from props
- Shows an alert if agent mode is used without a project

### 5. Updated BaseEditor and EditorTabsPane
- Added `getStorageProvider` to props type
- Passed through to editor containers

## How it Works

1. AI sends `initialize_project` command with project name and example slug
2. The command is processed by EditorFunctionCallRunner
3. Special handling detects the initialization request
4. Calls the callback to create project from example
5. The callback in AskAiEditorContainer:
   - Finds the example by slug
   - Sets up project configuration
   - Triggers actual project creation through MainFrame

## Testing Instructions

To test this implementation:

1. Open GDevelop without any project
2. Use AI chat/agent mode
3. AI should be able to use the `initialize_project` command
4. Command should create a new project based on the specified example

## Example AI Command

```json
{
  "name": "initialize_project",
  "arguments": "{\"name\": \"My Platformer Game\", \"example_slug\": \"geometry-monster\"}"
}
```