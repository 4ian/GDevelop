# Flamingo Flight - Implementation Guide

This guide will help you implement all game logic in GDevelop using the event system.

## 🎯 Quick Start

1. Open `game.json` in GDevelop
2. Add placeholder assets (colored rectangles work fine for prototyping!)
3. Follow the event implementation sections below
4. Test frequently as you build

## 📋 Implementation Checklist

### Phase 1: Core Setup
- [ ] Add FloridaCore extension to project
- [ ] Create placeholder sprites for all objects
- [ ] Position objects in scenes
- [ ] Test scene transitions

### Phase 2: Menu Scene
- [ ] Title screen layout
- [ ] Button hover effects
- [ ] Play button functionality
- [ ] High score display
- [ ] Background music loop

### Phase 3: Main Game - Player Control
- [ ] Flamingo flapping mechanic
- [ ] Gravity and vertical movement
- [ ] Animation state machine
- [ ] Screen bounds constraint
- [ ] Particle trail effect

### Phase 4: Main Game - Obstacles
- [ ] Obstacle spawning system
- [ ] Scrolling movement
- [ ] Collision detection
- [ ] Despawn when off-screen
- [ ] Difficulty scaling

### Phase 5: Main Game - Power-Ups
- [ ] Power-up spawning
- [ ] Collection detection
- [ ] Power-up effects (speed, shield, multiplier, weather)
- [ ] Visual feedback
- [ ] Timer management

### Phase 6: Main Game - Scoring
- [ ] Distance tracking
- [ ] Score calculation
- [ ] High score persistence
- [ ] UI updates
- [ ] Milestone achievements

### Phase 7: Weather & Environment
- [ ] FloridaCore weather integration
- [ ] Day/night cycle
- [ ] Weather particle effects
- [ ] Background color transitions
- [ ] Environmental hazards

### Phase 8: Game Over
- [ ] Death detection
- [ ] Score summary
- [ ] New high score celebration
- [ ] Retry button
- [ ] Return to menu button

### Phase 9: Polish
- [ ] Sound effects
- [ ] Music transitions
- [ ] Screen shake on collision
- [ ] Achievement notifications
- [ ] Performance optimization

---

## 🎬 Scene 1: Menu Scene

### Layout Setup

**Position these objects:**
- `MenuBackground`: (0, 0) - Full screen tiled sprite
- `TitleText`: (960, 200) - Centered at top
- `HighScoreText`: (960, 400) - Centered below title
- `PlayButton`: (960, 700) - Centered

### Events Implementation

#### Group: "Menu Setup"

```
📌 Event: At the beginning of the scene
├─ Action: FloridaCore::SetWeather("sunny", 7)
├─ Action: FloridaCore::StartDayNightCycle(300)
├─ Action: Center camera on 960, 540
├─ Action: Set HighScoreText text to "Best: " + ToString(GlobalVariable(HighScore))
└─ Action: Play music "menu_theme" (looping, volume 0.7)
```

#### Group: "Play Button Interaction"

```
📌 Event: Cursor/touch is on PlayButton
├─ Action: PlayButton: Set animation to "Hover"
└─ Action: PlayButton: Set scale to 1.1

📌 Event: Cursor/touch is NOT on PlayButton
├─ Action: PlayButton: Set animation to "Idle"
└─ Action: PlayButton: Set scale to 1.0

📌 Event: PlayButton is clicked (Mouse button released)
├─ Action: Play sound "button_click"
├─ Action: Wait 0.2 seconds
└─ Action: Change scene to "MainGame"
```

---

## 🎮 Scene 2: Main Game

### Layout Setup

**Layer: "Sky"**
- `SkyBackground`: (0, 0) - Full screen

**Layer: "Clouds"**
- `CloudsLayer`: (0, 100) - Tiled sprite for parallax

**Layer: "Ground"**
- `GroundLayer`: (0, 780) - Bottom tiled sprite

**Layer: "" (Main)**
- `Flamingo`: (400, 540) - Center-left of screen
- `ParticleTrail`: (400, 540) - Attached to flamingo

**Layer: "UI"**
- `ScoreText`: (960, 50) - Top center
- `DistanceText`: (50, 50) - Top left

**Layer: "Weather"**
- `WeatherParticles`: (960, -50) - Top center

### Events Implementation

#### Group: "🎬 Scene Initialization"

```
📌 Event: At the beginning of the scene
├─ Action: Set GlobalVariable(GameState.IsPlaying) to true
├─ Action: Set GlobalVariable(GameState.CurrentScore) to 0
├─ Action: Set GlobalVariable(GameState.Distance) to 0
├─ Action: Set GlobalVariable(GameState.Difficulty) to 1
├─ Action: Set GlobalVariable(GameState.PowerUpActive) to false
├─ Action: Set SceneVariable(ScrollSpeed) to 200
├─ Action: Set SceneVariable(SpawnTimer) to 0
├─ Action: Set SceneVariable(PowerUpTimer) to 0
├─ Action: Set SceneVariable(PelicansAvoided) to 0
├─ Action: FloridaCore::SetWeather("sunny", 5)
├─ Action: FloridaCore::StartDayNightCycle(240)
├─ Action: Center camera on Flamingo
├─ Action: ParticleTrail: Start emitting
├─ Action: Create object SkyBackground at 960, 540 on layer "Sky"
├─ Action: Create object CloudsLayer at 960, 200 on layer "Clouds"
├─ Action: Create object GroundLayer at 960, 930 on layer "Ground"
├─ Action: Create object WeatherParticles at 960, -50 on layer "Weather"
├─ Action: WeatherParticles: Stop emitting
└─ Action: Play music "game_theme" (looping, volume 0.6)
```

#### Group: "🦩 Flamingo Controls"

```
📌 Event: Mouse button pressed OR Touch is down
   ├─ Condition: Flamingo.Variable(IsAlive) is true
   ├─ Action: Flamingo: Set Variable(VerticalSpeed) to -Flamingo.Variable(FlapPower)
   ├─ Action: Flamingo: Set animation to "Flap"
   ├─ Action: Flamingo: Rotate toward -20 degrees (ease out, 0.1s)
   ├─ Action: Play sound "flap"
   └─ Action: ParticleTrail: Set emitter force to 60
```

```
📌 Event: Always
   ├─ Condition: Flamingo.Variable(IsAlive) is true
   ├─ Sub-event: Flamingo Y position < 50
   │   └─ Action: Flamingo: Set Y to 50
   ├─ Sub-event: Flamingo Y position > 1030
   │   └─ Action: Flamingo: Set Y to 1030
   │       Action: Do = TriggerDeath() [See Death Group]
   └─ Action: // Keep flamingo at fixed X position (400)
       Action: Flamingo: Set X position to 400
```

```
📌 Event: Always
   ├─ Condition: Flamingo.Variable(IsAlive) is true
   ├─ Action: Flamingo: Add Flamingo.Variable(Gravity) * TimeDelta() to Y position
   ├─ Action: Flamingo: Add Flamingo.Variable(Gravity) * TimeDelta() to Variable(VerticalSpeed)
   ├─ Action: Flamingo: Set Y to Flamingo.Y() + Flamingo.Variable(VerticalSpeed) * TimeDelta()
   ├─ Sub-event: Flamingo.Variable(VerticalSpeed) > 0
   │   ├─ Action: Flamingo: Set animation to "Glide"
   │   ├─ Action: Flamingo: Rotate toward 20 degrees (ease out, 0.2s)
   │   └─ Action: ParticleTrail: Set emitter force to 40
   └─ Action: ParticleTrail: Set position to Flamingo.X(), Flamingo.Y()
```

#### Group: "📜 Parallax Scrolling"

```
📌 Event: Always
   ├─ Condition: GlobalVariable(GameState.IsPlaying) is true
   ├─ Action: SkyBackground: Change X offset by -5 * TimeDelta()
   ├─ Action: CloudsLayer: Change X offset by -SceneVariable(ScrollSpeed) * 0.5 * TimeDelta()
   ├─ Action: GroundLayer: Change X offset by -SceneVariable(ScrollSpeed) * 1.5 * TimeDelta()
   └─ Action: Camera: Set X to CameraX() + 2 (subtle forward push)
```

#### Group: "🌴 Obstacle Spawning"

```
📌 Event: Always
   ├─ Action: SceneVariable(SpawnTimer): Add TimeDelta()
   └─ Sub-event: SceneVariable(SpawnTimer) >= 2.5 / GlobalVariable(GameState.Difficulty)
       ├─ Action: SceneVariable(SpawnTimer): Set to 0
       ├─ Action: Do = ChooseObstacle() [Random number 0-100]
       ├─ Sub-event: Random(100) < 60
       │   └─ Action: Create PalmTree at 2000, Random(400) + 300
       ├─ Sub-event: Random(100) >= 60 AND Random(100) < 85
       │   └─ Action: Create Building at 2000, 780 - Building.Height()
       └─ Sub-event: Random(100) >= 85
           └─ Action: Create Pelican at 2000, Random(500) + 200
```

```
📌 Event: For each object Obstacles (group)
   ├─ Action: Obstacles: Add -SceneVariable(ScrollSpeed) * TimeDelta() to X position
   └─ Sub-event: Obstacles.X() < -200
       └─ Action: Delete Obstacles
```

```
📌 Event: Flamingo is in collision with PalmTree OR Building
   ├─ Condition: Flamingo.Variable(HasShield) is false
   └─ Action: Do = TriggerDeath() [See Death Group]

📌 Event: Flamingo is in collision with Pelican
   ├─ Condition: Flamingo.Variable(HasShield) is false
   ├─ Action: Do = TriggerDeath()
   └─ Else:
       ├─ Action: Delete Pelican
       └─ Action: Play sound "shield_block"
```

```
📌 Event: Flamingo X position > Pelican X position
   ├─ Condition: Pelican exists
   ├─ Condition: Pelican.Variable(Counted) is false
   ├─ Action: Pelican: Set Variable(Counted) to true
   ├─ Action: SceneVariable(PelicansAvoided): Add 1
   ├─ Action: GlobalVariable(GameState.CurrentScore): Add 50
   └─ Sub-event: SceneVariable(PelicansAvoided) >= 10
       └─ Action: FloridaCore::UnlockAchievement("pelican_pal")
           Action: Play sound "achievement"
```

#### Group: "⭐ Power-Up Spawning"

```
📌 Event: Always
   ├─ Action: SceneVariable(PowerUpTimer): Add TimeDelta()
   └─ Sub-event: SceneVariable(PowerUpTimer) >= Random(8) + 5
       ├─ Action: SceneVariable(PowerUpTimer): Set to 0
       ├─ Action: Do = RandomPowerUp = Random(4)
       ├─ Sub-event: RandomPowerUp == 0
       │   └─ Action: Create SpeedBoost at 2000, Random(600) + 200
       ├─ Sub-event: RandomPowerUp == 1
       │   └─ Action: Create Shield at 2000, Random(600) + 200
       ├─ Sub-event: RandomPowerUp == 2
       │   └─ Action: Create ScoreMultiplier at 2000, Random(600) + 200
       └─ Sub-event: RandomPowerUp == 3
           └─ Action: Create Sunshine at 2000, Random(600) + 200
```

```
📌 Event: For each object PowerUps (group)
   ├─ Action: PowerUps: Add -SceneVariable(ScrollSpeed) * TimeDelta() to X position
   ├─ Action: PowerUps: Rotate by 180 * TimeDelta() degrees
   └─ Sub-event: PowerUps.X() < -200
       └─ Action: Delete PowerUps
```

```
📌 Event: Flamingo is in collision with SpeedBoost
   ├─ Action: Delete SpeedBoost
   ├─ Action: SceneVariable(ScrollSpeed): Set to 400
   ├─ Action: Wait SpeedBoost.Variable(Duration) seconds
   ├─ Action: SceneVariable(ScrollSpeed): Set to 200
   └─ Action: Play sound "powerup_collect"

📌 Event: Flamingo is in collision with Shield
   ├─ Action: Delete Shield
   ├─ Action: Flamingo: Set Variable(HasShield) to true
   ├─ Action: Flamingo: Set effect "outline" enabled
   ├─ Action: Wait Shield.Variable(Duration) seconds
   ├─ Action: Flamingo: Set Variable(HasShield) to false
   ├─ Action: Flamingo: Set effect "outline" disabled
   └─ Action: Play sound "powerup_collect"

📌 Event: Flamingo is in collision with ScoreMultiplier
   ├─ Action: Delete ScoreMultiplier
   ├─ Action: GlobalVariable(GameState.PowerUpActive): Set to true
   ├─ Action: Wait ScoreMultiplier.Variable(Duration) seconds
   ├─ Action: GlobalVariable(GameState.PowerUpActive): Set to false
   └─ Action: Play sound "powerup_collect"

📌 Event: Flamingo is in collision with Sunshine
   ├─ Action: Delete Sunshine
   ├─ Action: FloridaCore::SetWeather("sunny", 10)
   └─ Action: Play sound "powerup_collect"
```

#### Group: "📊 Scoring & Progression"

```
📌 Event: Always
   ├─ Condition: GlobalVariable(GameState.IsPlaying) is true
   ├─ Action: GlobalVariable(GameState.Distance): Add SceneVariable(ScrollSpeed) * TimeDelta() / 10
   ├─ Action: DistanceText: Set text to Floor(GlobalVariable(GameState.Distance)) + "m"
   ├─ Sub-event: GlobalVariable(GameState.PowerUpActive) is true
   │   └─ Action: GlobalVariable(GameState.CurrentScore): Add 2 * TimeDelta() * 10
   └─ Sub-event: GlobalVariable(GameState.PowerUpActive) is false
       └─ Action: GlobalVariable(GameState.CurrentScore): Add 1 * TimeDelta() * 10
       Action: ScoreText: Set text to ToString(Floor(GlobalVariable(GameState.CurrentScore)))
```

```
📌 Event: Always
   ├─ Sub-event: GlobalVariable(GameState.Distance) >= 100
   │   ├─ Condition: FloridaCore::HasAchievement("first_flight") is false
   │   └─ Action: FloridaCore::UnlockAchievement("first_flight")
   │       Action: Play sound "achievement"
   ├─ Sub-event: GlobalVariable(GameState.Distance) >= 500
   │   ├─ Condition: FloridaCore::HasAchievement("everglades_explorer") is false
   │   └─ Action: FloridaCore::UnlockAchievement("everglades_explorer")
   │       Action: Play sound "achievement"
   └─ Sub-event: GlobalVariable(GameState.Distance) >= 1000
       ├─ Condition: FloridaCore::HasAchievement("coastal_cruiser") is false
       └─ Action: FloridaCore::UnlockAchievement("coastal_cruiser")
           Action: Play sound "achievement"
```

```
📌 Event: Always
   ├─ Sub-event: GlobalVariable(GameState.Distance) > 250
   │   └─ Action: GlobalVariable(GameState.Difficulty): Set to 1.5
   ├─ Sub-event: GlobalVariable(GameState.Distance) > 500
   │   └─ Action: GlobalVariable(GameState.Difficulty): Set to 2.0
   └─ Sub-event: GlobalVariable(GameState.Distance) > 1000
       └─ Action: GlobalVariable(GameState.Difficulty): Set to 3.0
```

#### Group: "🌦️ Weather & Day/Night System"

```
📌 Event: Always
   ├─ Action: Do = TimeOfDay = FloridaCore::GetTimeOfDay()
   ├─ Sub-event: TimeOfDay >= 5 AND TimeOfDay < 7
   │   ├─ Condition: FloridaCore::HasAchievement("sunrise_chaser") is false
   │   └─ Action: FloridaCore::UnlockAchievement("sunrise_chaser")
   │       Action: Play sound "achievement"
   ├─ Sub-event: TimeOfDay >= 6 AND TimeOfDay < 12
   │   └─ Action: SkyBackground: Set color to RGB(135, 206, 250) [Morning Sky]
   ├─ Sub-event: TimeOfDay >= 12 AND TimeOfDay < 17
   │   └─ Action: SkyBackground: Set color to RGB(100, 180, 255) [Afternoon Sky]
   ├─ Sub-event: TimeOfDay >= 17 AND TimeOfDay < 19
   │   └─ Action: SkyBackground: Set color to RGB(255, 150, 100) [Sunset]
   └─ Sub-event: TimeOfDay >= 19 OR TimeOfDay < 6
       └─ Action: SkyBackground: Set color to RGB(25, 25, 112) [Night Sky]
```

```
📌 Event: Random(1000) < 5
   ├─ Action: Do = RandomWeather = Random(4)
   ├─ Sub-event: RandomWeather == 0
   │   └─ Action: FloridaCore::SetWeather("rain", Random(3) + 3)
   ├─ Sub-event: RandomWeather == 1
   │   └─ Action: FloridaCore::SetWeather("thunderstorm", Random(5) + 5)
   ├─ Sub-event: RandomWeather == 2
   │   └─ Action: FloridaCore::SetWeather("hurricane", 10)
   └─ Sub-event: RandomWeather == 3
       └─ Action: FloridaCore::SetWeather("sunny", Random(5) + 5)
```

```
📌 Event: FloridaCore::GetWeatherType() == "rain"
   ├─ Action: WeatherParticles: Start emitting
   ├─ Action: WeatherParticles: Set flow to 200
   └─ Action: WeatherParticles: Set particle color to Light Blue

📌 Event: FloridaCore::GetWeatherType() == "thunderstorm"
   ├─ Action: WeatherParticles: Start emitting
   ├─ Action: WeatherParticles: Set flow to 400
   ├─ Action: WeatherParticles: Set particle color to Dark Grey
   └─ Action: SceneVariable(ScrollSpeed): Set to SceneVariable(ScrollSpeed) * 0.8

📌 Event: FloridaCore::GetWeatherType() == "hurricane"
   ├─ Action: WeatherParticles: Start emitting
   ├─ Action: WeatherParticles: Set flow to 800
   ├─ Action: WeatherParticles: Set emitter angle to -30 (wind effect)
   ├─ Action: Flamingo: Add Random(40) - 20 to X (turbulence)
   ├─ Action: SceneVariable(ScrollSpeed): Set to SceneVariable(ScrollSpeed) * 1.5
   ├─ Sub-event: GlobalVariable(GameState.Distance) > 100
   │   ├─ Condition: FloridaCore::HasAchievement("hurricane_survivor") is false
   │   └─ Action: FloridaCore::UnlockAchievement("hurricane_survivor")
   │       Action: Play sound "achievement"
   └─ Action: Camera: Shake with amplitude 5

📌 Event: FloridaCore::GetWeatherType() == "sunny"
   └─ Action: WeatherParticles: Stop emitting
```

#### Group: "💀 Death System"

```
📌 Function: TriggerDeath
   ├─ Action: Flamingo: Set Variable(IsAlive) to false
   ├─ Action: Flamingo: Set animation to "Hit"
   ├─ Action: GlobalVariable(GameState.IsPlaying): Set to false
   ├─ Action: ParticleTrail: Stop emitting
   ├─ Action: Camera: Shake with amplitude 10, duration 0.5s
   ├─ Action: Play sound "crash"
   ├─ Action: Flamingo: Rotate toward 90 degrees
   ├─ Action: Flamingo: Set opacity to 100 (tween, 0.5s)
   ├─ Action: Wait 1.5 seconds
   ├─ Sub-event: GlobalVariable(GameState.CurrentScore) > GlobalVariable(HighScore)
   │   └─ Action: GlobalVariable(HighScore): Set to GlobalVariable(GameState.CurrentScore)
   └─ Action: Change scene to "GameOver"
```

---

## 💀 Scene 3: Game Over

### Layout Setup

**Position objects:**
- `GameOverBackground`: (0, 0) - Full screen
- `GameOverText`: (960, 200) - Top center
- `FinalScoreText`: (960, 400) - Center
- `BestScoreText`: (960, 500) - Below score
- `RetryButton`: (750, 750) - Left center
- `MenuButton`: (1170, 750) - Right center

### Events Implementation

#### Group: "Scene Setup"

```
📌 Event: At the beginning of the scene
├─ Action: FinalScoreText: Set text to "Score: " + ToString(Floor(GlobalVariable(GameState.CurrentScore)))
├─ Action: BestScoreText: Set text to "Best: " + ToString(Floor(GlobalVariable(HighScore)))
├─ Sub-event: GlobalVariable(GameState.CurrentScore) >= GlobalVariable(HighScore)
│   ├─ Action: FinalScoreText: Set color to Gold
│   ├─ Action: Play sound "new_highscore"
│   └─ Action: Create particle burst at FinalScoreText position
└─ Action: Play music "gameover_theme" (not looping, volume 0.5)
```

#### Group: "Button Interactions"

```
📌 Event: Cursor/touch is on RetryButton
├─ Action: RetryButton: Set animation to "Hover"
└─ Action: RetryButton: Set scale to 1.1

📌 Event: Cursor/touch is NOT on RetryButton
├─ Action: RetryButton: Set animation to "Idle"
└─ Action: RetryButton: Set scale to 1.0

📌 Event: RetryButton is clicked
├─ Action: Play sound "button_click"
├─ Action: Wait 0.2 seconds
└─ Action: Change scene to "MainGame"
```

```
📌 Event: Cursor/touch is on MenuButton
├─ Action: MenuButton: Set animation to "Hover"
└─ Action: MenuButton: Set scale to 1.1

📌 Event: Cursor/touch is NOT on MenuButton
├─ Action: MenuButton: Set animation to "Idle"
└─ Action: MenuButton: Set scale to 1.0

📌 Event: MenuButton is clicked
├─ Action: Play sound "button_click"
├─ Action: Wait 0.2 seconds
└─ Action: Change scene to "MenuScene"
```

---

## 🎨 Asset Specifications

See `ASSET_SPECS.md` for detailed asset requirements.

## 🔧 Testing Tips

1. **Use Colored Rectangles** for prototyping - don't wait for art!
2. **Test One Feature at a Time** - Add events incrementally
3. **Check Console** - Look for FloridaCore weather/achievement logs
4. **Adjust Constants** - Tweak speeds, timers, and forces for feel
5. **Play Often** - Game feel is everything!

## 🐛 Debugging Common Issues

### Flamingo falls through ground
- Check Y position constraint in "Always" event
- Ensure collision with ground triggers death

### Obstacles don't spawn
- Verify SpawnTimer is incrementing
- Check Random() logic in spawn conditions
- Ensure obstacles are being created at X=2000

### Power-ups don't work
- Check collision detection is enabled
- Verify Variable() syntax is correct
- Check that timers are using scene variables

### Weather doesn't change
- Ensure FloridaCore extension is loaded
- Check that weather particles exist on "Weather" layer
- Verify weather condition checks use correct syntax

### Achievements don't unlock
- FloridaCore must be in extensions list
- Check GlobalVariable(FloridaAchievements) structure exists
- Verify condition checks use correct achievement IDs

## 📝 Performance Tips

1. **Limit Particles**: Max 500 for weather, 100 for trails
2. **Delete Off-Screen**: Remove obstacles when X < -200
3. **Object Pooling**: For future optimization, reuse obstacles
4. **Sprite Sizes**: Keep sprites under 512x512 pixels
5. **Audio Format**: Use OGG for music, WAV/OGG for SFX

---

## 🚀 Next Steps

Once implementation is complete:

1. **Playtest** for 30 minutes - find what's fun!
2. **Balance** difficulty curve
3. **Replace Placeholders** with real art
4. **Add Sounds** for all actions
5. **Polish** with juice (particles, screen shake, tweens)
6. **Optimize** for mobile if targeting that platform
7. **Build** and share for testing!

---

## 📚 Additional Resources

- [GDevelop Documentation](https://wiki.gdevelop.io/)
- [Florida Games Playbook](../../FLORIDA_GAMES_PLAYBOOK.md)
- [FloridaCore Extension API](../shared/extensions/FloridaCore/README.md)

**Good luck building your awesome Florida game!** 🦩🌴✨
