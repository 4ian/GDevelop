# Florida Games - Master Development Plan

## Project Overview

A collection of Florida-themed games built on GDevelop, designed to share common assets, mechanics, and code while maintaining independence for standalone distribution.

## Game Portfolio

### 1. **Everglades Explorer** (Platformer)
**Theme**: Navigate the swamps and wetlands of the Everglades
**Core Mechanics**: Platform jumping, swimming, avoiding wildlife hazards
**Shared Systems**: Physics, collision detection, character controller
**Unique Features**: Water physics, wildlife AI, environmental storytelling
**Target Audience**: Ages 8+
**Estimated Complexity**: Medium

**Key Florida Elements**:
- Alligators and crocodiles as obstacles/enemies
- Mangrove forests as platforms
- Airboat sequences
- Wildlife photography mini-game

### 2. **Miami Beach Runner** (Endless Runner)
**Theme**: Run along Miami's iconic beaches and Art Deco district
**Core Mechanics**: Auto-run, jump, slide, collect items
**Shared Systems**: Infinite scrolling, obstacle generation, scoring
**Unique Features**: Dynamic backgrounds, weather changes, day/night cycle
**Target Audience**: All ages
**Estimated Complexity**: Low-Medium

**Key Florida Elements**:
- Art Deco architecture
- Beach umbrellas and lifeguard stands
- Palm trees and tropical birds
- Cuban coffee power-ups
- Cruise ships in background

### 3. **Key West Treasure Hunt** (Puzzle/Adventure)
**Theme**: Solve puzzles across the Florida Keys to find pirate treasure
**Core Mechanics**: Inventory, puzzle-solving, point-and-click exploration
**Shared Systems**: Dialog system, inventory management
**Unique Features**: Multi-island exploration, historical facts integration
**Target Audience**: Ages 10+
**Estimated Complexity**: High

**Key Florida Elements**:
- Island hopping via boat
- Coral reef diving sequences
- Hemingway House and 6-toed cats
- Sunset celebration at Mallory Square
- Conch Republic lore

### 4. **Hurricane Hero** (Strategy/Management)
**Theme**: Prepare communities for hurricane season
**Core Mechanics**: Resource management, time management, decision-making
**Shared Systems**: UI framework, save/load system
**Unique Features**: Real weather data integration, educational content
**Target Audience**: Ages 12+
**Estimated Complexity**: High

**Key Florida Elements**:
- Hurricane tracking and prediction
- Emergency preparedness
- Community resilience building
- Evacuation planning
- Recovery and rebuilding

### 5. **Space Coast Launch** (Physics Puzzle)
**Theme**: Launch rockets from Kennedy Space Center
**Core Mechanics**: Trajectory physics, timing, upgrades
**Shared Systems**: Physics engine, particle effects
**Unique Features**: Realistic orbital mechanics (simplified), mission variety
**Target Audience**: Ages 8+
**Estimated Complexity**: Medium

**Key Florida Elements**:
- Kennedy Space Center setting
- Real rocket designs (SpaceX, NASA)
- Beach landing sequences
- Satellite deployment missions
- Space tourism theme

### 6. **Citrus Crush Saga** (Match-3 Puzzle)
**Theme**: Match Florida citrus fruits
**Core Mechanics**: Match-3 mechanics, cascade effects, special combos
**Shared Systems**: Grid system, animation framework
**Unique Features**: Seasonal events, grove progression
**Target Audience**: All ages
**Estimated Complexity**: Medium

**Key Florida Elements**:
- Oranges, grapefruits, key limes, tangerines
- Citrus grove backgrounds
- Sunshine state power-ups
- Seasonal harvest themes
- Florida agricultural history

### 7. **Manatee Rescue** (Simulation/Care)
**Theme**: Rescue and rehabilitate injured manatees
**Core Mechanics**: Care simulation, time management, mini-games
**Shared Systems**: UI framework, save system, achievement tracking
**Unique Features**: Educational content, real conservation partnerships
**Target Audience**: Ages 6+
**Estimated Complexity**: Medium

**Key Florida Elements**:
- Crystal River and Blue Spring settings
- Boat strike awareness
- Warm water habitats
- Release ceremonies
- Conservation education

### 8. **Art Deco Detective** (Mystery/Investigation)
**Theme**: Solve mysteries in 1930s-50s Miami Beach
**Core Mechanics**: Evidence collection, interrogation, deduction
**Shared Systems**: Dialog system, inventory, save/load
**Unique Features**: Period-accurate setting, branching narratives
**Target Audience**: Ages 13+
**Estimated Complexity**: Very High

**Key Florida Elements**:
- Art Deco Historic District
- Ocean Drive atmosphere
- 1950s Cuban influence
- Vintage cars and fashion
- Film noir aesthetic

### 9. **Flamingo Flight** (Casual Flying)
**Theme**: Guide a flamingo through Florida landscapes
**Core Mechanics**: Flappy-bird style or momentum-based flight
**Shared Systems**: Physics, parallax scrolling
**Unique Features**: Multiple biomes, migration patterns
**Target Audience**: All ages
**Estimated Complexity**: Low

**Key Florida Elements**:
- Wetlands, beaches, urban areas
- Other Florida birds as companions
- Weather challenges
- Seasonal migration
- Breeding ground destinations

### 10. **Gator Golf** (Mini-Golf/Sports)
**Theme**: Mini-golf with Florida wildlife hazards
**Core Mechanics**: Golf physics, course design, power control
**Shared Systems**: Physics engine, level editor potential
**Unique Features**: Dynamic obstacles, course creator mode
**Target Audience**: Ages 8+
**Estimated Complexity**: Medium

**Key Florida Elements**:
- Alligator water hazards
- Palm tree obstacles
- Themed courses (beach, swamp, theme park)
- Moving manatee platforms
- Hurricane wind mechanics

---

## Shared Asset Library Structure

### Visual Assets
```
florida-games-assets/
├── characters/
│   ├── player/
│   │   ├── animations/ (walk, run, jump, swim, idle)
│   │   └── variants/ (different outfits/skins)
│   ├── npcs/
│   │   ├── tourists/
│   │   ├── locals/
│   │   └── wildlife-handlers/
│   └── wildlife/
│       ├── alligators/
│       ├── manatees/
│       ├── flamingos/
│       ├── pelicans/
│       ├── dolphins/
│       └── sea-turtles/
├── environments/
│   ├── beaches/
│   │   ├── sand-textures/
│   │   ├── water-animations/
│   │   └── beach-objects/
│   ├── everglades/
│   │   ├── swamp-water/
│   │   ├── mangroves/
│   │   └── sawgrass/
│   ├── urban/
│   │   ├── miami-beach/
│   │   │   ├── art-deco-buildings/
│   │   │   └── ocean-drive/
│   │   ├── orlando/
│   │   └── tampa/
│   ├── keys/
│   │   ├── islands/
│   │   ├── bridges/
│   │   └── coral-reefs/
│   └── space-coast/
│       ├── launch-pads/
│       ├── rockets/
│       └── beach-facilities/
├── props/
│   ├── vegetation/
│   │   ├── palm-trees/
│   │   ├── tropical-plants/
│   │   └── citrus-trees/
│   ├── vehicles/
│   │   ├── airboats/
│   │   ├── boats/
│   │   ├── vintage-cars/
│   │   └── modern-cars/
│   └── interactive/
│       ├── collectibles/
│       ├── power-ups/
│       └── obstacles/
├── ui/
│   ├── florida-themed-buttons/
│   ├── menus/
│   ├── hud-elements/
│   ├── fonts/
│   │   ├── art-deco-style/
│   │   ├── beach-casual/
│   │   └── modern-clean/
│   └── icons/
│       ├── weather/
│       ├── wildlife/
│       └── florida-symbols/
└── effects/
    ├── particles/
    │   ├── water-splash/
    │   ├── sand/
    │   ├── tropical-rain/
    │   └── sunshine-rays/
    ├── weather/
    │   ├── hurricanes/
    │   ├── thunderstorms/
    │   └── clear-skies/
    └── lighting/
        ├── sunset/
        ├── sunrise/
        └── midday/
```

### Audio Assets
```
florida-games-audio/
├── music/
│   ├── tropical-upbeat/
│   ├── everglades-ambient/
│   ├── art-deco-jazz/
│   ├── beach-chill/
│   └── space-electronic/
├── sfx/
│   ├── wildlife/
│   │   ├── alligator-sounds/
│   │   ├── bird-calls/
│   │   ├── manatee-sounds/
│   │   └── dolphin-clicks/
│   ├── environment/
│   │   ├── waves/
│   │   ├── wind/
│   │   ├── rain/
│   │   └── thunder/
│   ├── vehicles/
│   │   ├── airboat/
│   │   ├── boat-motor/
│   │   └── car-engine/
│   └── ui/
│       ├── button-clicks/
│       ├── success-sounds/
│       └── failure-sounds/
└── voice/
    ├── narrator/
    └── character-voices/
```

---

## Shared Code Architecture

### Extension Structure
Create custom GDevelop extensions for reusable game systems:

#### 1. Florida Core Extension (`FloridaCore`)
```
Extensions/FloridaCore/
├── JsExtension.js
├── floridacoretools.ts
└── README.md
```

**Features**:
- Florida weather system (sunshine, rain, hurricanes)
- Day/night cycle with Florida-accurate sunrise/sunset
- Temperature and humidity simulation
- Florida-specific sound management
- Achievement system with Florida themes

#### 2. Florida Wildlife Extension (`FloridaWildlife`)
```
Extensions/FloridaWildlife/
├── JsExtension.js
├── behaviors/
│   ├── alligatorbehavior.ts
│   ├── manateebehavior.ts
│   ├── flamingobehavior.ts
│   └── dolphinbehavior.ts
├── objects/
│   ├── alligatorruntimeobject.ts
│   └── manateemuntimeobject.ts
└── README.md
```

**Features**:
- Wildlife AI behaviors (patrol, flee, attack, swim)
- Interaction systems (feed, photograph, rescue)
- Population spawning and management
- Conservation mechanics

#### 3. Florida Environment Extension (`FloridaEnvironment`)
```
Extensions/FloridaEnvironment/
├── JsExtension.js
├── waterphysics.ts
├── beachmechanics.ts
├── swampmechanics.ts
└── README.md
```

**Features**:
- Advanced water physics (swimming, waves, currents)
- Beach dynamics (tides, sand displacement)
- Swamp navigation (mud, vegetation)
- Weather effects on gameplay

#### 4. Florida UI Extension (`FloridaUI`)
```
Extensions/FloridaUI/
├── JsExtension.js
├── floriadialog.ts
├── floridascoring.ts
├── floridainventory.ts
└── themes/
    └── florida-ui-theme.json
```

**Features**:
- Consistent Florida-themed UI components
- Dialog system with Florida character personalities
- Inventory system with local item types
- Score/achievement display

---

## Versioning Strategy

### Semantic Versioning for Each Game
Format: `MAJOR.MINOR.PATCH-GAME_ID`

Example: `1.2.3-everglades`, `2.0.1-miami-runner`

**MAJOR**: Significant gameplay changes, new major features
**MINOR**: New levels, content additions, minor features
**PATCH**: Bug fixes, balance adjustments
**GAME_ID**: Unique identifier for each game

### Shared Library Versioning
Format: `MAJOR.MINOR.PATCH`

**Shared Extensions**:
- `FloridaCore`: Currently `1.0.0`
- `FloridaWildlife`: Currently `1.0.0`
- `FloridaEnvironment`: Currently `1.0.0`
- `FloridaUI`: Currently `1.0.0`

### Version Compatibility Matrix
Track which game versions work with which extension versions:

```json
{
  "everglades-explorer": {
    "gameVersion": "1.0.0",
    "dependencies": {
      "FloridaCore": "^1.0.0",
      "FloridaWildlife": "^1.0.0",
      "FloridaEnvironment": "^1.0.0"
    }
  },
  "miami-beach-runner": {
    "gameVersion": "1.0.0",
    "dependencies": {
      "FloridaCore": "^1.0.0",
      "FloridaEnvironment": "^1.0.0"
    }
  }
}
```

### Git Branching Strategy
```
main
├── develop
├── games/
│   ├── everglades-explorer
│   ├── miami-beach-runner
│   ├── key-west-treasure
│   └── ...
├── extensions/
│   ├── florida-core
│   ├── florida-wildlife
│   ├── florida-environment
│   └── florida-ui
└── assets/
    ├── visual-assets
    └── audio-assets
```

**Branch Naming**:
- `main`: Stable releases only
- `develop`: Integration branch
- `games/{game-name}`: Individual game development
- `extensions/{extension-name}`: Extension development
- `assets/{asset-type}`: Asset updates
- `feature/{feature-name}`: New features
- `hotfix/{issue}`: Emergency fixes

### Release Tags
```
git tag -a v1.0.0-everglades -m "Everglades Explorer v1.0.0"
git tag -a v1.0.0-miami-runner -m "Miami Beach Runner v1.0.0"
git tag -a florida-core-v1.0.0 -m "Florida Core Extension v1.0.0"
```

---

## Project Directory Structure

```
florida-games-project/
├── README.md
├── MASTER_PLAN.md (this file)
├── PLAYBOOK.md (development guide)
├── package.json (root package for tooling)
├── .gitignore
├── LICENSE
├── docs/
│   ├── game-design-documents/
│   │   ├── everglades-explorer.md
│   │   ├── miami-beach-runner.md
│   │   └── ...
│   ├── api-reference/
│   ├── tutorials/
│   └── style-guides/
├── games/
│   ├── everglades-explorer/
│   │   ├── game.json
│   │   ├── assets/ (game-specific)
│   │   ├── package.json
│   │   ├── README.md
│   │   └── CHANGELOG.md
│   ├── miami-beach-runner/
│   │   ├── game.json
│   │   ├── assets/
│   │   ├── package.json
│   │   ├── README.md
│   │   └── CHANGELOG.md
│   └── ...
├── shared/
│   ├── assets/
│   │   ├── visual/
│   │   │   ├── characters/
│   │   │   ├── environments/
│   │   │   ├── props/
│   │   │   ├── ui/
│   │   │   └── effects/
│   │   └── audio/
│   │       ├── music/
│   │       ├── sfx/
│   │       └── voice/
│   ├── extensions/
│   │   ├── FloridaCore/
│   │   ├── FloridaWildlife/
│   │   ├── FloridaEnvironment/
│   │   └── FloridaUI/
│   ├── templates/
│   │   ├── game-template/
│   │   ├── scene-templates/
│   │   └── object-templates/
│   └── tools/
│       ├── asset-pipeline/
│       ├── build-scripts/
│       └── deployment/
├── tests/
│   ├── extensions/
│   ├── integration/
│   └── e2e/
└── scripts/
    ├── create-new-game.sh
    ├── build-all-games.sh
    ├── deploy-game.sh
    └── update-shared-assets.sh
```

---

## Development Workflow

### Phase 1: Foundation (Weeks 1-4)
1. Set up repository structure
2. Create shared asset library foundation
3. Build core extensions (FloridaCore, FloridaEnvironment)
4. Establish coding standards and templates
5. Set up CI/CD pipeline

### Phase 2: Prototype Games (Weeks 5-8)
Priority games for prototyping:
1. **Flamingo Flight** (simplest, test core systems)
2. **Miami Beach Runner** (test scrolling, obstacles)
3. **Gator Golf** (test physics engine)

### Phase 3: Full Development (Weeks 9-24)
Develop remaining games in parallel teams:
- **Team 1**: Everglades Explorer, Manatee Rescue
- **Team 2**: Key West Treasure Hunt, Art Deco Detective
- **Team 3**: Hurricane Hero, Space Coast Launch
- **Team 4**: Citrus Crush Saga

### Phase 4: Polish & Release (Weeks 25-30)
1. Cross-game testing
2. UI/UX consistency pass
3. Performance optimization
4. Marketing asset creation
5. Staggered releases

---

## Asset Creation Pipeline

### Style Guide
- **Color Palette**: Florida-inspired
  - Ocean blues: #006994, #00BFFF, #87CEEB
  - Sunset oranges: #FF6B35, #F7931E, #FFD700
  - Nature greens: #2D5016, #90EE90, #32CD32
  - Sand tones: #F4E8C1, #DEB887, #D2B48C
  - Art Deco pastels: #FFB6C1, #E6E6FA, #FFDAB9

- **Art Style**: Vibrant, slightly stylized, family-friendly
- **Animation**: Smooth, 30-60 fps depending on game
- **Resolution**: 1920x1080 base, scalable

### Asset Naming Convention
```
{category}_{name}_{variant}_{size}.{ext}

Examples:
char_alligator_idle_512.png
env_beach_sand_tile_256.png
sfx_wave_crash_01.wav
music_everglades_ambient_loop.ogg
```

### Asset Formats
- **Images**: PNG (with alpha), JPEG (backgrounds)
- **Audio**: OGG (primary), MP3 (fallback)
- **Fonts**: TTF, WOFF2
- **Animations**: Sprite sheets (preferred), individual frames

---

## Testing Strategy

### Unit Tests
- Extension functionality
- Physics calculations
- Game logic functions

### Integration Tests
- Extension interoperability
- Asset loading and caching
- Save/load system

### Gameplay Tests
- Playability testing per game
- Difficulty curve validation
- Bug tracking and fixing

### Performance Tests
- Frame rate targets (60fps for action, 30fps acceptable for puzzle)
- Memory usage monitoring
- Load time optimization

### Cross-Platform Tests
- Web (Chrome, Firefox, Safari)
- Desktop (Windows, Mac, Linux)
- Mobile (iOS, Android) - for select games

---

## Deployment Strategy

### Distribution Channels
1. **Web**: gd.games, itch.io, personal website
2. **Desktop**: Steam, itch.io, standalone
3. **Mobile**: iOS App Store, Google Play (select games)

### Build Configurations
- **Development**: Debug builds, fast iteration
- **Staging**: Release builds with testing flags
- **Production**: Optimized, minified, compressed

### Update Strategy
- Hotfixes: Within 24-48 hours for critical bugs
- Minor updates: Monthly content/balance updates
- Major updates: Quarterly feature additions

---

## Marketing & Community

### Cross-Promotion
- Each game promotes others in the portfolio
- Shared achievements across games
- "Florida Games Collection" branding

### Educational Partnerships
- Florida schools and museums
- Conservation organizations
- Space Coast tourism

### Community Engagement
- Discord server for all Florida games
- User-generated content (course creator for Gator Golf)
- Seasonal events tied to Florida calendar

---

## Success Metrics

### Per-Game KPIs
- Daily Active Users (DAU)
- Session length
- Retention (Day 1, 7, 30)
- Completion rate
- User ratings

### Portfolio KPIs
- Total player base across all games
- Cross-game play rate
- Community engagement
- Revenue (if monetized)
- Educational impact

---

## Budget Considerations

### Asset Creation
- Character art: 5-10 characters per game
- Environment art: 3-5 biomes per game
- Audio: 10-20 tracks total, 50+ SFX
- UI/UX design: Shared system saves costs

### Development
- 3-5 developers for core team
- Contractors for specialized skills (3D, animation)
- QA testers per game

### Tools & Services
- GDevelop (free/open source)
- Asset creation tools (Blender, GIMP, Krita)
- Version control (GitHub)
- CI/CD (GitHub Actions)
- Hosting (varies by platform)

---

## Risk Management

### Technical Risks
- **Extension compatibility**: Maintain strict versioning
- **Performance issues**: Regular profiling and optimization
- **Platform changes**: Stay updated with GDevelop releases

### Design Risks
- **Scope creep**: Stick to defined game features
- **Quality variance**: Enforce style guides and review process
- **Player engagement**: Early testing and iteration

### Business Risks
- **Market saturation**: Focus on Florida uniqueness
- **Resource constraints**: Prioritize prototype games first
- **Licensing**: Ensure all assets are properly licensed

---

## Next Steps

1. ✅ Review and approve this master plan
2. Create detailed Game Design Documents for first 3 games
3. Set up git repository with proper structure
4. Begin asset library creation
5. Develop FloridaCore extension
6. Start prototyping Flamingo Flight

---

**Last Updated**: 2025-11-15
**Version**: 1.0.0
**Status**: Planning Phase
