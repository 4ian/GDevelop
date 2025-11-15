# Flamingo Flight - Asset Specifications

Complete specifications for all visual and audio assets needed for the game.

## 🎨 Visual Assets

### Character Sprites

#### Flamingo (Main Character)
**File**: `sprite_char_flamingo_[animation]_512.png`
**Size**: 512x512px (sprite will be 200-250px in-game)
**Style**: Vibrant, cartoonish, friendly
**Color**: Pink (#FF69B4 base with highlights)

**Animations Needed**:

1. **Idle** (3-4 frames)
   - Subtle bob animation
   - Wings at rest
   - Beak slightly open
   - Frame timing: 0.1s between frames

2. **Flap** (6-8 frames)
   - Wings fully extended upward
   - Body compressed on downstroke
   - Tail feathers spread
   - Dynamic motion blur optional
   - Frame timing: 0.05s (fast)

3. **Glide** (2-3 frames)
   - Wings extended
   - Gentle floating motion
   - Relaxed posture
   - Frame timing: 0.15s

4. **Hit** (3-4 frames)
   - Impact expression (stars, dazed look)
   - Spiral eyes optional
   - Ruffled feathers
   - Frame timing: 0.08s

**Notes**:
- Draw with visible outline (3-4px black)
- Include long flamingo legs (slightly tucked in flight)
- One-legged standing pose for menu screen
- Export with transparency (PNG)

---

### Obstacles

#### Palm Tree
**File**: `sprite_obstacle_palmtree_[variant]_512.png`
**Sizes**: Various (300-600px tall)
**Variants**: 3-4 different palm tree designs

**Details**:
- Coconut palm style
- Green fronds with brown trunk
- Slight wind sway animation (optional)
- Some with coconuts visible
- Variety in heights

#### Art Deco Building
**File**: `sprite_obstacle_building_artdeco_[variant]_512.png`
**Sizes**: 400-800px tall
**Variants**: 3-5 different building designs

**Details**:
- Miami Beach Art Deco style
- Pastel colors (#FFB6C1, #E6E6FA, #FFDAB9)
- Geometric patterns
- Neon sign accents optional
- Flat facades with clean lines

#### Modern Building
**File**: `sprite_obstacle_building_modern_[variant]_512.png`
**Sizes**: 600-1000px tall
**Variants**: 2-3 designs

**Details**:
- Contemporary glass/steel look
- Reflective blue windows
- Miami skyline style
- Sleek, tall rectangles

#### Pelican
**File**: `sprite_obstacle_pelican_flying_512.png`
**Size**: 400x300px
**Animation**: 4-6 frames of flying

**Details**:
- Florida brown pelican
- Wing flapping cycle
- Large bill visible
- Friendly but obstacle-like
- Slight variation in altitude per frame

---

### Power-Ups

All power-ups: **128x128px**, bright and shiny

#### Speed Boost
**File**: `sprite_powerup_speedboost_128.png`
**Animation**: 6-8 frames (spinning/glowing)

**Design**:
- Lightning bolt or wind symbol
- Yellow/orange gradient
- Sparkle effect
- Rotating animation

#### Shield
**File**: `sprite_powerup_shield_128.png`
**Animation**: 6-8 frames (pulsing)

**Design**:
- Bubble or force field
- Blue/cyan glow
- Semi-transparent look
- Subtle pulse

#### Score Multiplier
**File**: `sprite_powerup_multiplier_128.png`
**Animation**: 6-8 frames (spinning stars)

**Design**:
- Star or "2X" symbol
- Gold/yellow color
- Shimmering effect
- Coins optional

#### Sunshine
**File**: `sprite_powerup_sunshine_128.png`
**Animation**: 6-8 frames (rays pulsing)

**Design**:
- Bright sun with rays
- Yellow/orange (#FFD700)
- Warm, inviting
- Radiating light effect

---

### Backgrounds

#### Sky Background
**File**: `bg_env_sky_[time]_1920.jpg` or PNG
**Size**: 1920x1080px seamless tile
**Variants**:
- `morning` - Light blue (#87CEEB) with yellow hints
- `afternoon` - Bright blue (#00BFFF)
- `sunset` - Orange/pink gradient (#FF6B35 to #FFB6C1)
- `night` - Dark blue (#191970) with stars

**Details**:
- Seamless horizontal tiling
- Gradient from top to bottom
- Florida-accurate colors
- Optional: distant clouds

#### Clouds Layer
**File**: `bg_env_clouds_[style]_512.png`
**Size**: 512x256px seamless tile
**Variants**: 2-3 cloud patterns

**Details**:
- White fluffy clouds
- Semi-transparent
- Parallax-friendly
- Wispy cumulus style

#### Ground/Water Layer
**File**: `bg_env_ground_[variant]_512.png`
**Size**: 512x300px seamless tile
**Variants**:
- `beach` - Sand with waves
- `ocean` - Blue water with whitecaps
- `everglades` - Green wetlands

**Details**:
- Seamless horizontal tiling
- Bottom of screen perspective
- Detailed enough to be interesting
- Not too busy (background element)

---

### UI Elements

#### Title Text
Use system fonts or provide custom:
- **Font**: Bold, playful sans-serif
- **Color**: Pink (#FF69FF) with white outline
- **Effect**: Drop shadow or glow

#### Buttons
**Files**:
- `ui_button_play_[state]_256.png`
- `ui_button_retry_[state]_256.png`
- `ui_button_menu_[state]_256.png`

**States**: idle, hover
**Size**: 256x96px

**Design**:
- Rounded rectangles
- Florida beach colors (teal, coral, sand)
- Clear icon or text
- Slight 3D effect
- Larger on hover (code handles scaling)

#### HUD Text
Use system fonts with these settings:
- **Score**: 72pt, bold, white with black outline
- **Distance**: 48pt, regular, white with outline
- **High Score**: 60pt, bold, gold (#FFD700)

---

### Particle Effects

#### Flamingo Trail
**Type**: Procedural (no sprite needed)
**Settings**:
- Color: Pink gradient to transparent
- Size: 20px → 5px
- Lifetime: 0.5-0.8s
- Emission: 80 particles/sec

#### Weather Rain
**Type**: Procedural line particles
**Settings**:
- Color: Light blue/white
- Size: 8x2px lines
- Speed: Fast downward
- Quantity: 200-400 based on intensity

#### Weather Droplet Splashes
**File**: `effect_particle_splash_64.png` (optional)
**Size**: 64x64px
**Frames**: 4-6 frame animation

#### Collision Sparks
**File**: `effect_particle_stars_64.png`
**Size**: 64x64px
**Design**: Star burst, white/yellow

#### Achievement Pop
**File**: `ui_achievement_banner_512.png`
**Size**: 512x128px
**Design**: Gold banner with trophy icon

---

## 🔊 Audio Assets

### Music Tracks

#### Menu Theme
**File**: `music_menu_theme_loop.ogg`
**Duration**: 60-90 seconds (loops)
**Style**: Tropical, upbeat, steel drums optional
**BPM**: 120-140
**Instruments**: Light percussion, marimba, synth pads
**Mood**: Inviting, cheerful

#### Game Theme
**File**: `music_game_theme_loop.ogg`
**Duration**: 90-120 seconds (loops)
**Style**: Energetic, adventurous
**BPM**: 130-150
**Instruments**: Synth leads, drums, bass
**Mood**: Exciting, motivating, flowing

#### Game Over Theme
**File**: `music_gameover_theme.ogg`
**Duration**: 20-30 seconds (one-shot)
**Style**: Gentle, contemplative
**BPM**: 90-100
**Mood**: Melancholy but hopeful

---

### Sound Effects

#### Gameplay SFX

**Flap**
**File**: `sfx_player_flap_01.wav`
**Duration**: 0.2s
**Description**: Soft wing whoosh, not too harsh
**Volume**: Medium

**Crash/Hit**
**File**: `sfx_player_crash_01.wav`
**Duration**: 0.5s
**Description**: Impact with slight comedic "bonk"
**Volume**: Medium-High

**Achievement Unlock**
**File**: `sfx_achievement_unlock_01.wav`
**Duration**: 1-2s
**Description**: Triumphant chime, ascending notes
**Volume**: Medium

**New High Score**
**File**: `sfx_highscore_fanfare.wav`
**Duration**: 2-3s
**Description**: Victory fanfare, celebratory
**Volume**: High

#### Power-Up SFX

**Collect Power-Up**
**File**: `sfx_powerup_collect_01.wav`
**Duration**: 0.3s
**Description**: Pleasant ding or sparkle
**Volume**: Medium

**Speed Boost Active**
**File**: `sfx_powerup_speed_loop.ogg`
**Duration**: Loops for 5s
**Description**: Whooshing wind sound
**Volume**: Low-Medium

**Shield Block**
**File**: `sfx_powerup_shield_block.wav`
**Duration**: 0.4s
**Description**: Deflection sound, bouncy
**Volume**: Medium

#### UI SFX

**Button Click**
**File**: `sfx_ui_button_click.wav`
**Duration**: 0.1s
**Description**: Soft, pleasant click
**Volume**: Low-Medium

**Button Hover**
**File**: `sfx_ui_button_hover.wav`
**Duration**: 0.05s
**Description**: Subtle tick or chime
**Volume**: Low

---

### Ambient SFX (Optional)

**Ocean Waves**
**File**: `sfx_ambient_waves_loop.ogg`
**Duration**: Loops
**Description**: Gentle beach waves
**Volume**: Very Low (background)

**Seagulls/Birds**
**File**: `sfx_ambient_birds_loop.ogg`
**Duration**: Loops
**Description**: Occasional bird calls
**Volume**: Very Low

**Wind**
**File**: `sfx_ambient_wind_loop.ogg`
**Duration**: Loops
**Description**: Gentle breeze
**Volume**: Very Low

---

## 📏 Quick Reference - Asset Sizes

| Asset Type | Resolution | Format |
|------------|-----------|--------|
| Character (Flamingo) | 512x512 | PNG |
| Obstacles | 300-800px tall | PNG |
| Power-Ups | 128x128 | PNG |
| Backgrounds | 1920x1080 or tile | JPG/PNG |
| Tiles | 512px | PNG |
| UI Buttons | 256x96 | PNG |
| Particles | 64x64 | PNG |

| Audio Type | Format | Quality |
|------------|--------|---------|
| Music | OGG | 192kbps |
| SFX | WAV/OGG | 44.1kHz |
| Loops | OGG | 160kbps |

---

## 🎨 Color Palette Reference

### Primary Florida Colors
```
Ocean Blue:      #006994
Sky Blue:        #00BFFF
Light Sky:       #87CEEB
Sunset Orange:   #FF6B35
Sunset Gold:     #FFD700
Flamingo Pink:   #FF69B4
Palm Green:      #2D5016
Bright Green:    #90EE90
Sand Beige:      #F4E8C1
Sand Brown:      #DEB887
```

### Art Deco Pastels
```
Pastel Pink:     #FFB6C1
Pastel Purple:   #E6E6FA
Pastel Peach:    #FFDAB9
Mint Green:      #98FF98
```

---

## 📦 Asset Delivery

### For Prototyping
1. **Use colored shapes** in GDevelop shape painter
2. **Flamingo**: Pink rectangle
3. **Obstacles**: Brown/green rectangles
4. **Power-ups**: Colored circles with letters
5. **Backgrounds**: Solid color fills

### For Production
1. All sprites with transparent backgrounds (PNG)
2. Sprite sheets optional (individual frames preferred)
3. Seamless tiles marked clearly
4. All audio normalized to -3dB
5. Follow naming convention: `{type}_{category}_{name}_{variant}_{size}.{ext}`

---

## 🚀 Asset Creation Priority

### Phase 1: Critical (Need to Play)
- [ ] Flamingo (idle + flap animations)
- [ ] One obstacle type (palm tree)
- [ ] Basic sky background
- [ ] Flap sound effect

### Phase 2: Core Gameplay
- [ ] All obstacle types
- [ ] Power-up sprites
- [ ] Particle trail
- [ ] All power-up SFX
- [ ] Crash sound

### Phase 3: Polish
- [ ] All backgrounds with time variants
- [ ] UI buttons
- [ ] Game theme music
- [ ] Achievement sounds
- [ ] Weather particles

### Phase 4: Final Touches
- [ ] Menu music
- [ ] Ambient sounds
- [ ] Additional sprite polish
- [ ] High score fanfare
- [ ] Achievement banners

---

## 💡 Tips for Asset Creation

### Art Style Consistency
- Keep outlines same thickness (3-4px)
- Use consistent color palette
- Match lighting direction across all sprites
- Maintain similar level of detail

### Performance
- Keep sprites under 1MB each
- Use sprite sheets for animations when possible
- Compress PNGs with tools like TinyPNG
- Keep audio files under 500KB for SFX

### Testing
- View sprites at 1x, 0.5x, and 2x scale
- Test on light and dark backgrounds
- Check animations at different speeds
- Listen to SFX at different volumes

---

**Need help creating assets?**
- **Art**: Canva, GIMP, Krita, Procreate, Aseprite
- **Music**: GarageBand, FL Studio, Audacity
- **SFX**: Freesound.org, BFXR, Audacity
- **AI Tools**: Midjourney, DALL-E for concept art

**Free Asset Resources**:
- OpenGameArt.org
- Itch.io asset packs
- Kenney.nl (game assets)
- Freesound.org (audio)

---

**Assets Budget Estimate**:
- **DIY**: Free (use free tools + your time)
- **Stock Assets**: $50-200 (asset packs)
- **Commission Artist**: $500-2000 (full game art)
- **Commission Musician**: $200-500 (3 music tracks)

**Recommended Start**: Mix free assets + custom key pieces (Flamingo)

Good luck creating your Florida-themed assets! 🎨🎵
