// Modifications needed for InGameEditor.ts to implement grab cursor when space is pressed

// 1. Add this private field in the InGameEditor class (around line 408)
// Add after: private _windowHadFocus = true;

/** Keep track of the space key state to update cursor accordingly. */
private _wasSpacePressed = false;

// 2. Add this private method to handle cursor changes
/**
 * Updates the cursor style based on the space key state
 */
private _updateCursor(): void {
  const inputManager = this._runtimeGame.getInputManager();
  const isSpaceCurrentlyPressed = isSpacePressed(inputManager);
  
  // Only update cursor if space key state changed
  if (isSpaceCurrentlyPressed !== this._wasSpacePressed) {
    const canvas = this._runtimeGame.getRenderer().getCanvas();
    if (canvas) {
      if (isSpaceCurrentlyPressed) {
        // Show grab cursor when space is pressed
        canvas.style.cursor = 'grab';
      } else {
        // Reset to default cursor when space is released
        canvas.style.cursor = '';
      }
    }
    this._wasSpacePressed = isSpaceCurrentlyPressed;
  }
}

// 3. Add this call in the updateAndRender method (around line 2436)
// Add after: this._handleShortcuts();

this._updateCursor();

// 4. Also update the cursor to 'grabbing' when actually panning with space+mouse
// In the FreeCameraControl.step() method (around line 3007), modify the space+click section:

// Space + click: move the camera on its plane.
if (
  isSpacePressed(inputManager) &&
  inputManager.isMouseButtonPressed(0)
) {
  // Update cursor to grabbing when actively panning
  const canvas = this._editorCamera.editor.getRuntimeGame().getRenderer().getCanvas();
  if (canvas) {
    canvas.style.cursor = 'grabbing';
  }
  
  const xDelta = this._lastCursorX - inputManager.getCursorX();
  const yDelta = this._lastCursorY - inputManager.getCursorY();
  moveCameraByVector(up, -yDelta);
  moveCameraByVector(right, xDelta);
} else if (isSpacePressed(inputManager)) {
  // Reset to grab cursor when space is pressed but not clicking
  const canvas = this._editorCamera.editor.getRuntimeGame().getRenderer().getCanvas();
  if (canvas) {
    canvas.style.cursor = 'grab';
  }
}