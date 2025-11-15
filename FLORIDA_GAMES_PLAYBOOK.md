# Florida Games Development Playbook

## Table of Contents
1. [Quick Start](#quick-start)
2. [Setting Up Your Development Environment](#setting-up-your-development-environment)
3. [Creating a New Florida Game](#creating-a-new-florida-game)
4. [Using Shared Extensions](#using-shared-extensions)
5. [Asset Management](#asset-management)
6. [Code Standards](#code-standards)
7. [Testing Guidelines](#testing-guidelines)
8. [Version Control Workflow](#version-control-workflow)
9. [Build and Deployment](#build-and-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- GDevelop installed (latest version)
- Git installed
- Node.js 14+ and npm
- Text editor (VS Code recommended)

### 5-Minute Setup
```bash
# Clone the repository
git clone https://github.com/your-org/florida-games-project.git
cd florida-games-project

# Install dependencies
npm install

# Create your first game from template
npm run create-game -- --name "my-florida-game"

# Open in GDevelop
# File > Open > games/my-florida-game/game.json
```

---

## Setting Up Your Development Environment

### 1. Install Required Software

#### GDevelop IDE
```bash
# Download from https://gdevelop.io
# Or use the development version:
cd /path/to/GDevelop
cd newIDE/app
npm install
npm start
```

#### Version Control Setup
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Set up git hooks for the project
cd florida-games-project
npm run setup-hooks
```

#### Recommended VS Code Extensions
- Flow Language Support (for GDevelop IDE development)
- Prettier - Code formatter
- GitLens
- TODO Highlight
- Image Preview

### 2. Clone and Configure Repository

```bash
# Clone with submodules for shared assets
git clone --recursive https://github.com/your-org/florida-games-project.git

cd florida-games-project

# Install project dependencies
npm install

# Link shared extensions to GDevelop
npm run link-extensions
```

### 3. Configure GDevelop

**Set Extension Paths**:
1. Open GDevelop
2. Go to Preferences > Extensions
3. Add path to `florida-games-project/shared/extensions`

**Import Shared Assets**:
1. Preferences > Resources
2. Add `florida-games-project/shared/assets` as a resource directory

---

## Creating a New Florida Game

### Method 1: Using the Template Script

```bash
cd florida-games-project
npm run create-game -- --name "everglades-explorer" --template "platformer"
```

This creates:
```
games/everglades-explorer/
├── game.json
├── assets/
├── package.json
├── README.md
├── CHANGELOG.md
└── .gitignore
```

### Method 2: Manual Creation

#### Step 1: Create Directory Structure
```bash
mkdir -p games/your-game-name
cd games/your-game-name
```

#### Step 2: Create game.json
Start with the base template:

```json
{
  "firstLayout": "MainScene",
  "gdVersion": {
    "build": 0,
    "major": 5,
    "minor": 0,
    "revision": 0
  },
  "properties": {
    "name": "Your Florida Game",
    "author": "Your Name",
    "version": "0.1.0",
    "description": "A Florida-themed game",
    "packageName": "com.floridagames.yourgame",
    "orientation": "landscape",
    "windowWidth": 1920,
    "windowHeight": 1080,
    "maxFPS": 60,
    "minFPS": 30,
    "extensions": [
      {"name": "FloridaCore"},
      {"name": "FloridaEnvironment"}
    ]
  },
  "layouts": [],
  "externalLayouts": [],
  "eventsFunctionsExtensions": [],
  "externalEvents": [],
  "objects": [],
  "objectsGroups": [],
  "variables": [],
  "resources": {
    "resources": []
  }
}
```

#### Step 3: Create package.json for Versioning
```json
{
  "name": "@florida-games/your-game-name",
  "version": "0.1.0",
  "description": "Your game description",
  "private": true,
  "dependencies": {
    "@florida-games/core": "^1.0.0",
    "@florida-games/environment": "^1.0.0"
  },
  "scripts": {
    "build": "node ../../scripts/build-game.js",
    "test": "node ../../scripts/test-game.js",
    "deploy": "node ../../scripts/deploy-game.js"
  }
}
```

#### Step 4: Create README.md
```markdown
# Your Game Name

## Description
Brief description of your Florida-themed game.

## Features
- Feature 1
- Feature 2

## Florida Elements
- Specific Florida themes incorporated

## Development Status
- [ ] Prototype
- [ ] Alpha
- [ ] Beta
- [ ] Release

## Version History
See CHANGELOG.md
```

#### Step 5: Initialize Git Tracking
```bash
git checkout -b games/your-game-name
git add .
git commit -m "Initial commit for Your Game Name"
git push -u origin games/your-game-name
```

---

## Using Shared Extensions

### Available Florida Extensions

#### 1. FloridaCore
**Installation**:
```json
// In game.json, add to extensions:
{"name": "FloridaCore"}
```

**Usage Examples**:

**Weather System**:
```javascript
// In GDevelop Events:
// Condition: FloridaCore::IsSunny()
// Action: FloridaCore::SetWeather("hurricane", 3)
// Expression: FloridaCore::GetTemperature()
```

**Day/Night Cycle**:
```javascript
// Action: FloridaCore::StartDayNightCycle(24) // 24 seconds per day
// Condition: FloridaCore::IsNightTime()
// Expression: FloridaCore::GetTimeOfDay() // Returns 0-24
```

**Achievement System**:
```javascript
// Action: FloridaCore::UnlockAchievement("first_alligator_spotted")
// Condition: FloridaCore::HasAchievement("everglades_complete")
```

#### 2. FloridaWildlife
**Installation**:
```json
{"name": "FloridaWildlife"}
```

**Adding Wildlife**:
```javascript
// Create an alligator object
// Add behavior: FloridaWildlife::AlligatorBehavior

// Configure in events:
// Action: AlligatorBehavior::SetAggressionLevel(0.7)
// Action: AlligatorBehavior::Patrol(point1, point2)
// Condition: AlligatorBehavior::IsAttacking()
```

**Wildlife Spawning**:
```javascript
// Action: FloridaWildlife::SpawnWildlife("manatee", x, y, "calm")
// Action: FloridaWildlife::SetPopulationDensity("pelican", 0.5)
```

#### 3. FloridaEnvironment
**Water Physics**:
```javascript
// Add to water objects:
// Behavior: FloridaEnvironment::WaterPhysics

// Configure:
// Action: WaterPhysics::SetCurrentStrength(2.5)
// Action: WaterPhysics::EnableWaves(true)
// Condition: WaterPhysics::IsObjectSwimming(player)
```

**Beach Mechanics**:
```javascript
// Action: FloridaEnvironment::CreateTide(high, 120) // 120 seconds
// Expression: FloridaEnvironment::GetTideLevel()
```

#### 4. FloridaUI
**Dialog System**:
```javascript
// Action: FloridaUI::ShowDialog("Old Fisherman", "Welcome to the Keys!")
// Action: FloridaUI::ShowChoiceDialog(
//   "What will you do?",
//   ["Explore the reef", "Visit the lighthouse"]
// )
// Condition: FloridaUI::DialogChoiceSelected(0)
```

**Inventory**:
```javascript
// Action: FloridaUI::AddToInventory("key_lime", 5)
// Condition: FloridaUI::HasItem("boat_key")
// Action: FloridaUI::ShowInventory()
```

### Creating Your Own Extension

When game-specific mechanics don't fit shared extensions:

```bash
# In your game directory:
mkdir -p custom-extensions/MyGameMechanics
cd custom-extensions/MyGameMechanics
```

Create `JsExtension.js`:
```javascript
module.exports = {
  createExtension: function(_, gd) {
    const extension = new gd.PlatformExtension();

    extension
      .setExtensionInformation(
        "MyGameMechanics",
        "My Florida Game Specific Mechanics",
        "Custom mechanics for my specific game",
        "Your Name",
        "MIT"
      )
      .setExtensionHelpPath("/docs/mygame/mechanics");

    // Add your custom actions, conditions, expressions
    extension
      .addAction(
        "CustomAction",
        "Do something custom",
        "Perform a custom game action",
        "Execute custom action with value _PARAM0_",
        "My Game",
        "res/icon24.png",
        "res/icon16.png"
      )
      .addParameter("expression", "Value", "", false)
      .getCodeExtraInformation()
      .setFunctionName("myCustomFunction")
      .setIncludeFile("custom-extensions/MyGameMechanics/mygametools.ts");

    return extension;
  }
};
```

---

## Asset Management

### Organizing Game Assets

#### Directory Structure
```
games/your-game/assets/
├── sprites/
│   ├── characters/
│   ├── enemies/
│   └── objects/
├── backgrounds/
│   ├── layers/
│   └── tilesets/
├── audio/
│   ├── music/
│   └── sfx/
├── fonts/
└── ui/
```

### Using Shared Assets

#### Linking to Shared Resources
In GDevelop, when adding a resource:

1. **Absolute Path** (for shared assets):
   ```
   ../../shared/assets/visual/characters/alligator_idle.png
   ```

2. **Relative Path** (for game-specific assets):
   ```
   assets/sprites/custom_character.png
   ```

#### Asset Naming Convention
Follow this strict convention:
```
{type}_{category}_{name}_{variant}_{size}.{ext}

Examples:
sprite_char_player_idle_512.png
sprite_char_player_run_512.png
bg_env_beach_sunset_1920.jpg
sfx_animal_alligator_hiss_01.ogg
music_ambient_everglades_loop.ogg
```

### Asset Pipeline Scripts

#### Optimize Images
```bash
# Optimize all images in your game
npm run optimize-images -- --game your-game-name

# Optimize specific directory
npm run optimize-images -- --path games/your-game/assets/sprites
```

#### Generate Sprite Sheets
```bash
# From individual frames
npm run create-spritesheet -- \
  --input games/your-game/assets/frames/player \
  --output games/your-game/assets/sprites/player_spritesheet.png \
  --json games/your-game/assets/sprites/player_spritesheet.json
```

#### Audio Conversion
```bash
# Convert audio files to web-friendly formats
npm run convert-audio -- --input assets/audio/music.wav --output assets/audio/music.ogg
```

---

## Code Standards

### TypeScript/JavaScript for Extensions

#### Naming Conventions
```typescript
// Classes: PascalCase
class AlligatorBehavior extends gdjs.RuntimeBehavior {}

// Functions: camelCase
function calculateSwimSpeed(depth: number): number {}

// Constants: UPPER_SNAKE_CASE
const MAX_WILDLIFE_COUNT = 50;

// Variables: camelCase
let playerHealth = 100;
```

#### Code Structure
```typescript
/**
 * Florida Games Extension Function
 * @description Brief description of what this does
 * @param {gdjs.RuntimeScene} runtimeScene - The scene
 * @param {number} intensity - Weather intensity (0-10)
 */
namespace floridagames {
  export namespace weather {
    export const setWeather = (
      runtimeScene: gdjs.RuntimeScene,
      weatherType: string,
      intensity: number
    ): void => {
      // Validate inputs
      if (intensity < 0 || intensity > 10) {
        console.warn("Weather intensity must be between 0 and 10");
        return;
      }

      // Implementation
      const weatherSystem = runtimeScene.getGame().getVariables()
        .get("WeatherSystem");
      weatherSystem.getChild("type").setString(weatherType);
      weatherSystem.getChild("intensity").setNumber(intensity);
    };
  }
}
```

#### Performance Best Practices
```typescript
// ✅ GOOD: Reuse objects, avoid garbage
class WaterPhysics {
  private _tempVector: Float32Array;

  constructor() {
    this._tempVector = new Float32Array(2); // Allocate once
  }

  calculateFlow(x: number, y: number): Float32Array {
    this._tempVector[0] = x * this._flowRate;
    this._tempVector[1] = y * this._flowRate;
    return this._tempVector; // Return reused object
  }
}

// ❌ BAD: Creates garbage every frame
class WaterPhysics {
  calculateFlow(x: number, y: number): number[] {
    return [x * this._flowRate, y * this._flowRate]; // New array each call
  }
}
```

### GDevelop Event Best Practices

#### Event Organization
```
Scene: MainGameScene
├── External Events: "Common/PlayerControls"
├── External Events: "Common/FloridaWeather"
├── Group: "🎮 Player"
│   ├── Group: "Movement"
│   ├── Group: "Abilities"
│   └── Group: "Collision"
├── Group: "🌍 Environment"
│   ├── Group: "Water Interaction"
│   ├── Group: "Weather Effects"
│   └── Group: "Day/Night"
├── Group: "🐊 Wildlife"
│   └── Group: "Spawning"
└── Group: "🎯 Game Logic"
    ├── Group: "Scoring"
    └── Group: "Win/Lose"
```

#### Comment Standards
```
Event: Check if player is in water
├── Condition: Player is in collision with Water
└── Actions:
    ├── // Apply swimming physics
    ├── Apply force to Player: angle, strength
    ├── // Visual feedback
    └── Change opacity of Player to 180
```

#### Variable Naming
```
Global Variables:
├── GameState
│   ├── CurrentLevel (number)
│   ├── Score (number)
│   └── HighScore (number)
├── FloridaWeather
│   ├── Type (string: "sunny", "rain", "hurricane")
│   ├── Intensity (number: 0-10)
│   └── Duration (number)
└── PlayerProgress
    ├── WildlifePhotographed (structure)
    └── AchievementsUnlocked (array)

Scene Variables:
├── WildlifeCount (number)
├── TimeOfDay (number: 0-24)
└── TideLevel (number: -1 to 1)

Object Variables (Player):
├── Health (number)
├── SwimSpeed (number)
└── HasBoatKey (boolean)
```

---

## Testing Guidelines

### Manual Testing Checklist

Before committing, test these scenarios:

#### Gameplay Testing
- [ ] Game starts without errors
- [ ] Player controls respond correctly
- [ ] All scenes transition properly
- [ ] Shared extensions work as expected
- [ ] Game-specific mechanics function
- [ ] No console errors in browser dev tools

#### Performance Testing
- [ ] Maintains 60 FPS in typical gameplay
- [ ] No memory leaks after 5 minutes
- [ ] Asset loading is smooth
- [ ] No stuttering during weather effects

#### Cross-Platform Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test on mobile device (if applicable)
- [ ] Test desktop export (if applicable)

### Automated Testing

#### Extension Unit Tests
```bash
cd shared/extensions/FloridaCore
npm test
```

#### Integration Tests
```bash
# Test game with all extensions
npm run test:integration -- --game your-game-name
```

#### Performance Profiling
```bash
# Run game with profiling enabled
npm run profile -- --game your-game-name --duration 60
```

---

## Version Control Workflow

### Daily Workflow

#### Starting Work
```bash
# Update your branch
git checkout games/your-game-name
git pull origin games/your-game-name

# Create feature branch if needed
git checkout -b feature/new-level-design
```

#### Making Changes
```bash
# Make your changes in GDevelop
# Save the project

# Check what changed
git status
git diff game.json

# Stage and commit
git add game.json assets/
git commit -m "Add beach level with tide mechanics"
```

#### Committing Guidelines

**Commit Message Format**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance

**Examples**:
```bash
git commit -m "feat(everglades): Add alligator patrol behavior"

git commit -m "fix(miami-runner): Fix collision detection with palm trees

The collision boxes were too large causing false positives.
Reduced by 20% to match sprite better.

Closes #42"

git commit -m "perf(core): Optimize weather particle system

- Reduce particle count by 30%
- Use object pooling for particles
- Still maintains visual quality

Improves FPS from 45 to 60 in heavy rain."
```

### Branching Strategy

#### Game Development Branches
```bash
# Main game branch
games/your-game-name

# Feature branches
feature/your-game-name/new-mechanic

# Bug fixes
bugfix/your-game-name/collision-issue

# Release branches
release/your-game-name/v1.0.0
```

#### Merging to Main

```bash
# When game reaches milestone
git checkout games/your-game-name
git merge feature/your-game-name/new-mechanic

# Create pull request to develop
git push origin games/your-game-name
# Then create PR on GitHub: games/your-game-name -> develop
```

### Handling Shared Extensions

#### When Modifying Shared Extensions
```bash
# Create extension branch
git checkout -b extensions/florida-core/new-feature

# Make changes
cd shared/extensions/FloridaCore
# Edit files

# Test with games
npm run test:all-games

# Commit
git commit -m "feat(core): Add seasonal weather patterns"

# Create PR
git push origin extensions/florida-core/new-feature
# PR to develop for review
```

#### Updating Extension Versions
```bash
# In shared/extensions/FloridaCore/package.json
# Bump version following semver
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Tag the release
git tag -a florida-core-v1.1.0 -m "Add seasonal weather patterns"
git push --tags
```

---

## Build and Deployment

### Building for Web

#### Development Build
```bash
cd games/your-game-name
npm run build:dev
```

This creates:
```
games/your-game-name/build/
├── index.html
├── game.js
├── assets/
└── resources/
```

#### Production Build
```bash
npm run build:prod

# With optimizations:
npm run build:prod -- --optimize --compress
```

**Optimizations Include**:
- Code minification
- Image compression
- Audio conversion to optimal formats
- Resource preloading

### Building for Desktop

```bash
# Windows
npm run build:desktop -- --platform windows --game your-game-name

# macOS
npm run build:desktop -- --platform macos --game your-game-name

# Linux
npm run build:desktop -- --platform linux --game your-game-name
```

### Deployment

#### Deploy to gd.games
```bash
# Requires GDevelop account
npm run deploy:gdgames -- --game your-game-name

# Follow prompts for:
# - Game name
# - Description
# - Tags
# - Privacy settings
```

#### Deploy to Itch.io
```bash
# Configure itch.io settings in package.json:
{
  "itch": {
    "user": "your-username",
    "game": "your-game-slug"
  }
}

# Deploy
npm run deploy:itch -- --game your-game-name
```

#### Deploy to Custom Server
```bash
# Configure in package.json:
{
  "deploy": {
    "host": "yourserver.com",
    "path": "/var/www/games/your-game",
    "method": "sftp"
  }
}

# Deploy
npm run deploy:custom -- --game your-game-name
```

### Continuous Deployment

#### GitHub Actions Workflow
Create `.github/workflows/deploy-game.yml`:

```yaml
name: Deploy Game

on:
  push:
    branches:
      - games/*/main
    tags:
      - 'v*.*.*-*'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm ci

      - name: Build game
        run: npm run build:prod

      - name: Deploy to gd.games
        env:
          GDEVELOP_TOKEN: ${{ secrets.GDEVELOP_TOKEN }}
        run: npm run deploy:gdgames
```

---

## Troubleshooting

### Common Issues

#### Issue: Extension Not Loading
**Symptoms**: Extension appears in list but functions don't work

**Solution**:
1. Check extension path in GDevelop preferences
2. Verify `JsExtension.js` exports correctly
3. Check browser console for errors
4. Reload GDevelop (Ctrl+R / Cmd+R)

```bash
# Test extension independently
cd shared/extensions/FloridaCore
npm test
```

#### Issue: Shared Assets Not Found
**Symptoms**: Missing sprites or sounds in game

**Solution**:
1. Verify relative path in resource manager
2. Check file actually exists: `ls ../../shared/assets/path/to/file.png`
3. Ensure assets were committed to git
4. Re-link shared assets:

```bash
npm run link-shared-assets -- --game your-game-name
```

#### Issue: Performance Drops
**Symptoms**: Frame rate below 30 FPS

**Debug Steps**:
1. Open browser dev tools (F12)
2. Go to Performance tab
3. Record while playing
4. Look for:
   - Long event processing times
   - Excessive object creation
   - Large number of visible objects

**Solutions**:
```javascript
// Reduce particle count
ParticleSystem::SetMaxParticles(100) // Instead of 1000

// Use object pooling
// Don't: Create and delete objects every frame
// Do: Create pool at start, show/hide as needed

// Optimize collision detection
// Use collision groups and layers
// Limit collision checks to nearby objects
```

#### Issue: Game.json Merge Conflicts
**Symptoms**: Git shows conflicts in game.json

**Solution**:
```bash
# Accept your version
git checkout --ours game.json

# Or accept incoming version
git checkout --theirs game.json

# Or manually merge
# Open game.json in editor and resolve conflicts
# Then: git add game.json && git commit
```

**Prevention**: Work on separate scenes/external events when possible

#### Issue: Extension Version Mismatch
**Symptoms**: "Extension not compatible" error

**Solution**:
```bash
# Check current versions
npm run check-versions -- --game your-game-name

# Update game to use latest extension versions
npm run update-extensions -- --game your-game-name

# Or manually update in game.json:
{
  "extensions": [
    {"name": "FloridaCore", "version": "^1.2.0"}
  ]
}
```

### Getting Help

#### Documentation
- Read the [Master Plan](MASTER_PLAN.md)
- Check [API Reference](docs/api-reference/)
- Review [Example Games](games/_examples/)

#### Community
- Discord: #florida-games-dev
- GitHub Issues: Tag with game name
- Weekly dev meetings: Thursdays 2pm EST

#### Reporting Bugs

Create an issue with this template:
```markdown
**Game**: Your Game Name
**Version**: 1.2.3
**Platform**: Web/Desktop/Mobile
**GDevelop Version**: 5.x.x

**Description**:
Clear description of the issue

**Steps to Reproduce**:
1. Step one
2. Step two
3. See error

**Expected Behavior**:
What should happen

**Actual Behavior**:
What actually happens

**Screenshots/Videos**:
If applicable

**Console Errors**:
```
Paste any errors from browser console
```

**Additional Context**:
Any other relevant information
```

---

## Quick Reference

### Essential Commands
```bash
# Create new game
npm run create-game -- --name game-name --template platformer

# Build game
npm run build -- --game game-name

# Test game
npm run test -- --game game-name

# Deploy game
npm run deploy -- --game game-name --platform gdgames

# Update shared extensions
npm run update-extensions

# Optimize all assets
npm run optimize-assets -- --game game-name

# Check project health
npm run health-check
```

### Extension Function Quick Reference

**FloridaCore**:
```
SetWeather(type, intensity)
StartDayNightCycle(duration)
UnlockAchievement(id)
GetTemperature()
IsNightTime()
```

**FloridaWildlife**:
```
SpawnWildlife(type, x, y, behavior)
SetAggressionLevel(level)
EnableWildlifePhotography()
```

**FloridaEnvironment**:
```
CreateWater(x, y, width, height)
SetCurrentStrength(strength)
CreateTide(high, duration)
```

**FloridaUI**:
```
ShowDialog(speaker, text)
AddToInventory(item, count)
ShowChoiceDialog(text, choices)
```

---

## Appendix

### Template Files

#### Game Template Checklist
- [ ] game.json created
- [ ] package.json with version and dependencies
- [ ] README.md with game description
- [ ] CHANGELOG.md initialized
- [ ] .gitignore configured
- [ ] Initial assets folder structure
- [ ] At least one scene created
- [ ] Player object defined
- [ ] Camera setup
- [ ] Shared extensions added

### Asset Checklist
- [ ] All sprites use transparent PNG
- [ ] Audio in OGG format
- [ ] Naming convention followed
- [ ] Assets optimized for web
- [ ] License/attribution documented
- [ ] Backup copies stored

### Pre-Release Checklist
- [ ] All features implemented
- [ ] No critical bugs
- [ ] Performance tested (60fps maintained)
- [ ] Cross-browser tested
- [ ] Mobile tested (if applicable)
- [ ] All achievements work
- [ ] Save/load tested
- [ ] Documentation updated
- [ ] Version number updated
- [ ] CHANGELOG updated
- [ ] Git tagged with version
- [ ] Build tested
- [ ] Marketing assets prepared
- [ ] Legal review (licenses, content)

---

**Playbook Version**: 1.0.0
**Last Updated**: 2025-11-15
**Maintained By**: Florida Games Development Team
