# TextInput Spellcheck Feature Implementation

## Overview
Added a spellcheck property to the TextInput extension in GDevelop that allows users to enable or disable spell checking on input fields. This addresses the user's request for controls to change language or disable spell checking.

## Changes Made

### 1. Extension Definition (`Extensions/TextInput/JsExtension.js`)
- Added `spellcheck` property to the object's properties list (disabled by default)
- Added expression, condition, and action for the spellcheck property
- Property appears in the "Field" group in the object properties

### 2. Runtime Object (`Extensions/TextInput/textinputruntimeobject.ts`)
- Added `_spellcheck` private property to the TextInputRuntimeObject class
- Added `isSpellcheckEnabled()` getter method
- Added `setSpellcheck(value: boolean)` setter method
- Integrated spellcheck into network sync data
- Updated `updateFromObjectData` to handle spellcheck changes

### 3. Renderer (`Extensions/TextInput/textinputruntimeobject-pixi-renderer.ts`)
- Added spellcheck attribute to the HTML input element during creation
- Added `updateSpellcheck()` method to update the spellcheck attribute
- Called `updateSpellcheck()` during initialization

### 4. Data Types
- Added `spellcheck?: boolean` to the TextInputObjectData interface
- Added `spck: boolean` to the network sync data type

## Usage

### In the Editor
1. Add a TextInput object to your scene
2. In the object properties, find the "Enable spellcheck" option in the "Field" group
3. By default, spellcheck is disabled (unchecked)
4. Check the box to enable spellcheck for that input field

### During Runtime
Use actions and conditions to control spellcheck dynamically:

**Action Example:**
```
Set spellcheck of MyTextInput: Yes
```

**Condition Example:**
```
If spellcheck of MyTextInput is enabled
```

**Expression Example:**
```
MyTextInput.Spellcheck() // Returns 1 if enabled, 0 if disabled
```

## Benefits
1. **User Control**: Players can now have input fields without red squiggly lines when typing game-specific terms
2. **Language Flexibility**: Disabling spellcheck prevents issues with non-English languages
3. **Professional Look**: Games can have cleaner input fields without browser spell checking interfering
4. **Dynamic Control**: Developers can enable/disable spellcheck based on game logic

## Default Behavior
- Spellcheck is **disabled by default** to prevent unwanted spell checking in games
- This can be changed per instance in the editor
- Can be modified at runtime using actions

## Technical Notes
- The implementation uses the HTML5 `spellcheck` attribute on input elements
- Compatible with all modern browsers
- Works for both single-line inputs and text areas
- The feature is properly synchronized in networked games