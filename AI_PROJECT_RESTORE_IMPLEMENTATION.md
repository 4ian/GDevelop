# AI Project Restore Implementation

## Overview
This implementation provides automatic project saving and restoration capabilities for AI agent requests, leveraging GDevelop's existing cloud save features and version history system.

## Key Features

### 1. Automatic Project Save Before AI Agent Requests
- When a user starts a new AI agent request, the project is automatically saved to create a cloud version
- This only works for cloud projects (projects saved to GDevelop Cloud)
- The current version ID is captured and stored with the AI request

### 2. Version-Based Restoration
- Uses GDevelop's existing cloud version system instead of custom serialization
- Leverages the `onOpenCloudProjectOnSpecificVersion` function from MainFrame
- Provides seamless restoration to the exact state before AI agent modifications

### 3. Smart UI Integration
- Restore button appears at the top of AI agent chats that have a stored initial version
- Only visible for cloud projects with stored version information
- Button shows loading state during restoration process

## Implementation Details

### Backend API Changes
- Extended `AiRequest` type to include `initialProjectVersionId?: string | null`
- This field stores the cloud project version ID captured before starting the agent

### Frontend Changes

#### 1. AskAiEditorContainer.js
- Added `onOpenCloudProjectOnSpecificVersion` prop to enable version restoration
- Modified AI request creation to save project and capture version ID for cloud projects
- Added `onRestoreInitialProject` callback that uses cloud version system
- Only attempts version capture for cloud projects (`storageProvider.internalName === 'Cloud'`)

#### 2. AiRequestChat/index.js
- Added restore button UI at the top of agent chats
- Added `isCloudProject` prop to control button visibility
- Added loading state for restore operation
- Proper error handling during restoration

#### 3. EditorFunctions/index.js
- Extended `EditorCallbacks` type to include optional `onSave` function
- Enables AI components to trigger project saves when needed

#### 4. MainFrame/index.js
- Added `onOpenCloudProjectOnSpecificVersion` to editor props
- This connects the AI editor to the existing version restoration system

## User Experience

### Starting an Agent Request
1. User opens AI agent and submits a request
2. System automatically saves the current project (creates a new version)
3. Version ID is stored with the AI request for later restoration
4. AI agent proceeds with modifications

### Restoring to Initial State
1. User sees "Click here to restore the project as it was at the beginning" button
2. Clicking the button triggers cloud version restoration
3. Project is restored to the exact state before AI agent started
4. All changes made by the AI agent are discarded

## Technical Advantages

### 1. Leverages Existing Infrastructure
- Uses GDevelop's mature cloud save and version system
- No custom serialization/deserialization code needed
- Inherits all cloud storage reliability and error handling

### 2. Scalable and Reliable
- Cloud versions are professionally managed and backed up
- No local storage limitations or browser storage issues
- Consistent across different devices and sessions

### 3. Version History Integration
- Restored versions appear in the project's version history
- Users can access version history features for AI-generated content
- Seamless integration with existing version management workflow

## Limitations and Considerations

### 1. Cloud Projects Only
- Feature only works for projects saved to GDevelop Cloud
- Local projects cannot use this restoration feature
- Clear messaging is provided when feature is unavailable

### 2. Version Storage
- Relies on cloud project version creation during save
- Version IDs are stored locally in the AI request metadata
- If local storage is cleared, version reference may be lost

### 3. Network Dependency
- Restoration requires internet connection for cloud access
- Standard cloud storage network limitations apply

## Error Handling

### 1. Save Failures
- If initial save fails, AI request continues without version storage
- User is informed that restoration won't be available
- Graceful degradation ensures AI functionality remains available

### 2. Restoration Failures
- Comprehensive error logging for debugging
- UI provides feedback during restoration process
- Button disabled during restoration to prevent conflicts

### 3. Non-Cloud Projects
- Restore functionality hidden for non-cloud projects
- Clear console warnings when attempting unsupported operations
- No impact on existing AI functionality for local projects

## Future Enhancements

### 1. Backend Integration
- Could extend backend API to store `initialProjectVersionId` server-side
- Would enable restoration across sessions and devices
- Currently relies on local client-side storage

### 2. Local Project Support
- Could implement local project snapshots using browser storage
- Would require custom serialization for non-cloud projects
- Currently prioritizes cloud projects for reliability

### 3. Enhanced UI
- Could add confirmation dialogs for restoration
- Might include preview of changes before restoration
- Could integrate with version history UI components