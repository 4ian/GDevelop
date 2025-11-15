# Flamingo Flight - Quick Start 🦩

**Get from zero to flying in 15 minutes!**

## ⚡ Ultra-Quick Start

1. **Open in GDevelop**: `File > Open > game.json`
2. **Add FloridaCore Extension**: `Preferences > Extensions > Add folder` → Select `../../shared/extensions`
3. **Add Placeholder Art**: Use GDevelop's shape painter to make colored rectangles
4. **Start Coding Events**: Follow the Implementation Guide
5. **Test Often**: Preview frequently to feel the gameplay

## 🎯 Core Concept

**One-Button Flying Game** - Click/tap to flap, avoid obstacles, collect power-ups, survive Florida weather!

Think: Flappy Bird meets beautiful Florida landscapes with weather systems and achievements.

## 🎮 Game Loop

```
Start → Fly → Dodge → Collect → Score → Die → Retry
         ↑                                    ↓
         └────────────────────────────────────┘
```

## 🛠️ Implementation Priority

### 1️⃣ Make it Playable (30 min)
- [ ] Flamingo sprite (pink rectangle)
- [ ] Flapping controls (click to rise)
- [ ] Gravity (falls when not flapping)
- [ ] One obstacle type scrolling
- [ ] Collision = game over

**Test**: Can you fly and hit things? Great!

### 2️⃣ Make it Fun (1 hour)
- [ ] Smooth physics (tune gravity/flap power)
- [ ] Parallax backgrounds (3 layers)
- [ ] Obstacle variety (3 types)
- [ ] Random spawning
- [ ] Score display

**Test**: Is it addictive for 5 minutes? Great!

### 3️⃣ Make it Florida (1 hour)
- [ ] FloridaCore weather integration
- [ ] Day/night cycle
- [ ] Weather particles (rain, storm)
- [ ] Achievement unlocks
- [ ] Florida-colored backgrounds

**Test**: Does it feel like Florida? Great!

### 4️⃣ Make it Awesome (2 hours)
- [ ] All power-ups working
- [ ] Particle trail behind flamingo
- [ ] Sound effects
- [ ] Background music
- [ ] Menu and Game Over screens
- [ ] High score saving

**Test**: Would you play this for 30 minutes? Ship it!

## 📋 Event Implementation Shortcuts

### Flamingo Flying (Core Mechanic)
```
When: Mouse button pressed
Do:
  - Add -400 to flamingo vertical speed
  - Play flap animation
  - Play flap sound

Always:
  - Add 1200 * TimeDelta() to vertical speed (gravity)
  - Move flamingo by vertical speed
  - Keep flamingo X at 400 (fixed position)
  - Rotate based on vertical speed (-20° to +20°)
```

### Obstacle Spawning (Simple Version)
```
Always:
  - Add TimeDelta() to SpawnTimer

When: SpawnTimer > 2 seconds
Do:
  - Create PalmTree at (2000, random 300-700)
  - Reset SpawnTimer to 0

For each PalmTree:
  - Move left by 200 pixels/second
  - If X < -100: Delete it

When: Flamingo collision with PalmTree
Do:
  - Play crash sound
  - Go to GameOver scene
```

### FloridaCore Weather (1 Line!)
```
At beginning:
  - FloridaCore::SetWeather("sunny", 8)
  - FloridaCore::StartDayNightCycle(180)

When: Random(1000) < 5 (0.5% chance each frame)
Do:
  - FloridaCore::SetWeather("rain", random 5-10)
```

## 🎨 Placeholder Art Guide

**Don't wait for real art!** Use shapes:

| Object | Shape | Color | Size |
|--------|-------|-------|------|
| Flamingo | Rectangle | Pink (#FF69B4) | 80x100 |
| Palm Tree | Rectangle | Green (#2D5016) | 60x400 |
| Building | Rectangle | Pastel Pink | 200x600 |
| Sky | Tiled Rectangle | Sky Blue (#87CEEB) | 1920x1080 |
| Ground | Tiled Rectangle | Sand (#DEB887) | 1920x300 |
| Power-Up | Circle | Yellow (#FFD700) | 40x40 |

**Add a 3px black outline to everything for visibility!**

## 🔊 Sound Placeholder

- **Flap**: Say "fwoop" into your phone (seriously!)
- **Crash**: Say "bonk"
- **Music**: Hum a tropical tune
- **Or**: Use royalty-free from Freesound.org

## 🐛 Common First-Time Bugs

### Flamingo falls too fast
→ Reduce gravity from 1200 to 800

### Can't flap high enough
→ Increase flap power from 400 to 600

### Obstacles too close together
→ Increase spawn timer from 2 to 3 seconds

### Flamingo flies off screen
→ Add bounds check: `if Y < 50: Y = 50` and `if Y > 1030: Y = 1030`

### Weather doesn't work
→ Check FloridaCore is in Extensions list
→ Check spelling: `FloridaCore::SetWeather()` (capital C!)

## 📊 Balancing Numbers

**These feel good in testing:**

| Parameter | Value | Tweakable? |
|-----------|-------|------------|
| Flap Power | -400 | Yes! (300-600) |
| Gravity | 1200 | Yes! (800-1500) |
| Scroll Speed | 200 | Yes! (150-300) |
| Spawn Interval | 2.5s | Yes! (1.5-4s) |
| Flamingo X | 400 | Maybe (300-500) |
| Max Vertical Speed | ±600 | Yes! (400-800) |

**Pro Tip**: Record these in a text file as you tune them!

## 🎯 Minimum Viable Game Checklist

- [ ] Flamingo appears
- [ ] Click makes it flap
- [ ] It falls when not flapping
- [ ] One obstacle scrolls
- [ ] Hitting obstacle shows "Game Over"
- [ ] Can restart

**If you have these 6 things, you have a game!** Everything else is polish.

## 🚀 Next Steps After MVP

1. **Playtest yourself** for 10 minutes
2. **Show someone** and watch them play
3. **Fix the #1 frustration** (usually physics)
4. **Add more obstacles** for variety
5. **Add score** for motivation
6. **Add one power-up** for excitement
7. **Repeat steps 1-6** until it's fun!

## 📚 Full Documentation

- **README.md** - Game overview and features
- **IMPLEMENTATION_GUIDE.md** - Complete event logic (all scenes)
- **ASSET_SPECS.md** - Detailed art and audio requirements
- **CHANGELOG.md** - Version history

## 💡 Development Philosophy

> **Make it work, make it fun, make it pretty - in that order!**

1. **Prototype ugly** - Rectangles are fine!
2. **Test constantly** - Preview every 5 minutes
3. **Fail fast** - Bad ideas reveal themselves quickly
4. **Iterate** - First version always needs tweaking
5. **Feel > Looks** - Physics matter more than graphics
6. **Scope small** - Finish a small game > abandon a big one

## 🎓 GDevelop Tips

- **F5** or **Preview Button** = Test your game instantly
- **Ctrl+Z** = Undo (use liberally!)
- **Right-click objects** = Quick access to properties
- **Console (F12)** = See errors and logs
- **Performance** tab = Check FPS and debug lag

## 🏆 Success Criteria

**You'll know it's working when:**
- ✅ You die and immediately click "Retry"
- ✅ You want to beat your own high score
- ✅ 5 minutes feels like 30 seconds
- ✅ Someone watching says "let me try!"
- ✅ You catch yourself playing instead of coding

## 🌟 First Session Goals

**In your first 1-hour session, aim to:**
1. Open the project in GDevelop
2. Add the FloridaCore extension
3. Create placeholder flamingo sprite
4. Implement basic flapping (see shortcuts above)
5. Add gravity and ground collision
6. Test and feel the physics

**If you finish that, you're 80% done with core gameplay!**

## 🎉 Celebration Milestones

- 🥉 First successful flap
- 🥈 First obstacle avoided
- 🥇 First 100m traveled
- 🏆 First complete game loop (menu → game → game over)
- 💎 First person besides you plays it
- 🚀 First public release

---

## Need Help?

1. **Check Implementation Guide** - Detailed event logic
2. **Check Asset Specs** - Art requirements
3. **Read Playbook** - General GDevelop advice
4. **GDevelop Wiki** - https://wiki.gdevelop.io
5. **FloridaCore README** - Extension documentation

---

**Remember**: Every great game started as colored rectangles. Start simple, make it fun, add polish later!

**Now go build something awesome!** 🦩🌴✨
