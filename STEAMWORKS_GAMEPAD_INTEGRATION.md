# Steamworks Input Integration for Gamepads Extension

## Overview

This change integrates Steam Input support into the GDevelop Gamepads extension (`extensions/reviewed/Gamepads.json` in GDevelop-extensions). When running on Steam via Electron/Steamworks, the Gamepads extension now detects and uses Steam Input controllers as a fallback when the browser's Gamepad API doesn't see them.

## What Changed

### 1. Gamepads Extension (`extensions/reviewed/Gamepads.json`)

#### New Helper Functions (in `onFirstSceneLoaded` code block)

- **`getSteamInput()`**: Returns `gdjs.steamworks.steamAPI.input` if Steamworks is available, otherwise `null`.
- **`initSteamActionHandles(steamInput)`**: Caches handles for standard Steam Input action names. If the game has configured a `"GameControls"` action set with standard action names, actual button/axis data can be read from Steam Input.
- **`steamTypeToId(steamType)`**: Maps Steam Input controller types (e.g., `'XBox360Controller'`, `'PS5Controller'`, `'SteamDeckController'`) to human-readable gamepad ID strings (e.g., `'Xbox Controller (Steam Input)'`).
- **`createSteamGamepad(steamInput, controller, playerId)`**: Creates a Gamepad-API-compatible object from a Steam Input controller, including button/axis data if Steam Input actions are configured.

#### Modified Functions

- **`getGamepad(playerId)`**: Now falls back to Steam Input if `navigator.getGamepads()` returns `null` for the given player. Creates a synthetic Gamepad-compatible object via `createSteamGamepad()`.

- **`frameBeginningTask.update()`**: Now also iterates over Steam Input controllers. For controllers not visible to the browser Gamepad API but present in Steam Input, button states are tracked using cached digital action handles.

- **`isXbox(gamepad, playerId)`**: Now accepts an optional `playerId` parameter. When provided, checks the Steam Input controller type for accurate Xbox detection. Also checks the `_steamInputType` property on synthetic Steam gamepad objects. Falls back to the original `gamepad.id` string matching.

- **`gdjs._extensionController` exports**: Added `getSteamInput`, `createSteamGamepad`, and `steamTypeToId` to the exported controller object.

#### Modified Expression/Condition Code Blocks

- **`ConnectedGamepadsCount`**: After counting browser gamepads, also checks `gdjs.steamworks.steamAPI.input.getControllers().length` and uses `Math.max()` to report the higher count.

- **`C_Controller_X_is_connected`**: If `navigator.getGamepads()` doesn't have a gamepad at the given index, falls back to checking Steam Input controllers.

- **`C_Controller_type`**: Now passes `playerId` to `isXbox()` for Steam-aware type detection. The `gamepad.id` string matching already works with synthetic Steam gamepads since their IDs contain type info (e.g., `"PS4 Controller (Steam Input)"`).

- **`GamepadType`**: Already works correctly because `getGamepad()` now returns synthetic objects with meaningful `id` strings for Steam controllers.

### 2. Steamworks Extension (`Extensions/Steamworks/`)

#### `types.d.ts`

- Added `InputType` const enum to the `input` namespace with all Steam Input controller types: `Unknown`, `SteamController`, `XBox360Controller`, `XBoxOneController`, `GenericGamepad`, `PS4Controller`, `AppleMFiController`, `AndroidController`, `SwitchJoyConPair`, `SwitchJoyConSingle`, `SwitchProController`, `MobileTouch`, `PS3Controller`, `PS5Controller`, `SteamDeckController`.
- Added `getType(): InputType` and `getHandle(): bigint` methods to the `Controller` class.

#### `Z_steamworksinputtools.ts`

- Added `getSteamControllerType(controllerIndex)` function that returns the Steam Input type string for a controller at the given index.

## Steam Input Action Configuration

For full input support (button presses and analog sticks) from Steam Input, game developers should configure a Steam Input Configuration (IGA file) in their Steamworks settings with the following standard action names:

**Action Set:** `GameControls`

**Digital Actions** (mapped to standard gamepad button indices 0-17):
| Index | Action Name | Gamepad Button |
|-------|-------------|----------------|
| 0 | `a` | A / Cross |
| 1 | `b` | B / Circle |
| 2 | `x` | X / Square |
| 3 | `y` | Y / Triangle |
| 4 | `lb` | LB / L1 |
| 5 | `rb` | RB / R1 |
| 6 | `lt` | LT / L2 (digital) |
| 7 | `rt` | RT / R2 (digital) |
| 8 | `back` | Back / Select / Share |
| 9 | `start` | Start / Options |
| 10 | `left_stick_click` | L3 |
| 11 | `right_stick_click` | R3 |
| 12 | `dpad_up` | D-Pad Up |
| 13 | `dpad_down` | D-Pad Down |
| 14 | `dpad_left` | D-Pad Left |
| 15 | `dpad_right` | D-Pad Right |
| 16 | `ps_button` | PS / Home |
| 17 | `touchpad_click` | Touchpad Click |

**Analog Actions** (mapped to standard gamepad axes):
| Action Name | Axes |
|-------------|------|
| `left_stick` | axes[0] (x), axes[1] (y) |
| `right_stick` | axes[2] (x), axes[3] (y) |

Without this configuration, Steam controllers will still be detected as connected and their type will be correctly identified, but actual button/axis input will rely on Steam's built-in gamepad emulation via the browser Gamepad API.

## Behavior Summary

| Scenario | Controller Detection | Type Detection | Input Data |
|----------|---------------------|----------------|------------|
| Desktop browser (no Steam) | Browser Gamepad API | `gamepad.id` string | Browser Gamepad API |
| Electron + Steam (gamepad emulation) | Browser Gamepad API | Steam Input `getType()` (preferred) + `gamepad.id` fallback | Browser Gamepad API |
| Electron + Steam (controller only in Steam Input) | Steam Input fallback | Steam Input `getType()` | Steam Input actions (if configured) or stub data |
| Steam Deck | Browser Gamepad API or Steam Input fallback | Steam Input `getType()` | Browser Gamepad API or Steam Input actions |

## Backward Compatibility

All changes are backward-compatible:
- When Steamworks is not available (web browser, non-Steam desktop), the extension behaves exactly as before.
- The `isXbox(gamepad, playerId)` function still works when called with only `gamepad` (the `playerId` parameter is optional).
- Existing callers of `gdjs._extensionController` functions continue to work unchanged.
