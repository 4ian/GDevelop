# Changelog - Flamingo Flight

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- Multiplayer mode (pass-and-play)
- Daily challenges
- Seasonal themes (holidays, events)
- More power-up types
- Boss battles (hurricane events)
- Story mode with levels
- Character customization
- Leaderboards integration

## [0.1.0] - 2025-11-15

### Added
- Initial project structure
- Complete game design document
- Three scenes: MenuScene, MainGame, GameOver
- Game objects defined:
  - Flamingo player character with 4 animations (Idle, Flap, Glide, Hit)
  - Three obstacle types (PalmTree, Building, Pelican)
  - Four power-up types (SpeedBoost, Shield, ScoreMultiplier, Sunshine)
  - Parallax background layers (Sky, Clouds, Ground)
  - Particle systems (Trail, Weather effects)
  - Complete UI elements
- Game mechanics framework:
  - Momentum-based flying physics
  - Tap/click to flap controls
  - Gravity and vertical speed system
  - Parallax scrolling backgrounds
  - Obstacle spawning and despawning
  - Power-up collection system
  - Collision detection
  - Death and game over system
- Scoring system:
  - Distance tracking
  - Score accumulation
  - High score persistence
  - Score multiplier power-up
  - Pelican avoidance bonus
- FloridaCore extension integration:
  - Dynamic weather system (sunny, rain, thunderstorm, hurricane)
  - Day/night cycle with visual changes
  - Temperature simulation
  - Six achievements defined and implemented
- Progressive difficulty:
  - Spawn rate increases with distance
  - Speed increases at milestones
  - Weather intensity varies
- Complete documentation:
  - README with game overview
  - IMPLEMENTATION_GUIDE with step-by-step event logic
  - ASSET_SPECS with detailed asset requirements
  - CHANGELOG (this file)
- Global and scene variables structure
- Object groups for easy management
- Multi-layer scene organization

### Documentation
- Comprehensive implementation guide with all event logic
- Detailed asset specifications (sprites, animations, audio)
- Asset creation priority list
- Color palette reference
- Performance optimization tips

### Technical
- GDevelop 5.4+ compatible
- Resolution: 1920x1080 (adaptive)
- Target: 60 FPS
- Platform: Web, Desktop (future: Mobile)

## Milestones

### v0.2.0 - Prototype (Planned)
- [ ] Placeholder graphics implemented
- [ ] Core gameplay loop functional
- [ ] Player controls feel good
- [ ] Obstacle spawning works
- [ ] First playtest completed

### v0.3.0 - Alpha (Planned)
- [ ] Basic art assets added
- [ ] Sound effects implemented
- [ ] Background music added
- [ ] All power-ups functional
- [ ] Weather system working
- [ ] Achievements unlock properly

### v0.4.0 - Beta (Planned)
- [ ] All final art assets
- [ ] Polished animations
- [ ] Complete audio design
- [ ] Particle effects polished
- [ ] Performance optimized
- [ ] Balance testing complete

### v1.0.0 - Release (Planned)
- [ ] All features complete
- [ ] Bug-free gameplay
- [ ] Cross-platform tested
- [ ] Marketing assets ready
- [ ] Launch ready!

## Development Notes

### 2025-11-15 - Project Initialization
Created complete game structure with comprehensive documentation. Game is designed with:
- **Core Loop**: Addictive tap-to-flap flying mechanic
- **Florida Theme**: Authentic elements (weather, wildlife, locations)
- **Progression**: Difficulty scales naturally with distance
- **Variety**: Multiple obstacle and power-up types
- **Polish**: Particles, effects, weather, day/night cycle
- **Achievements**: 6 milestone achievements via FloridaCore

**Design Philosophy**:
- Easy to learn, hard to master
- Family-friendly and accessible
- Showcases Florida beauty and themes
- Demonstrates shared extension system
- Professional, scalable codebase

**Next Steps**:
1. Implement events in GDevelop following IMPLEMENTATION_GUIDE
2. Create placeholder art (colored shapes)
3. Test core flying mechanic until it feels great
4. Add obstacles and test difficulty curve
5. Integrate FloridaCore extension
6. Playtest and iterate

---

## Version Naming

Format: `MAJOR.MINOR.PATCH-flamingo`

- **MAJOR**: Significant gameplay changes, new major features
- **MINOR**: New content, minor features, balance changes
- **PATCH**: Bug fixes, small tweaks

Examples:
- `0.1.0-flamingo` - Initial design
- `0.2.0-flamingo` - Prototype playable
- `1.0.0-flamingo` - First release
- `1.1.0-flamingo` - New game mode added
- `1.1.1-flamingo` - Bug fixes

---

**Last Updated**: 2025-11-15
**Status**: Design Complete, Implementation Pending
**Next Version**: 0.2.0 (Prototype)
