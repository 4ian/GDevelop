# FloridaCore Extension

Core functionality for all Florida-themed games.

## Features

### Weather System
- Dynamic weather changes (sunny, rain, hurricane)
- Weather intensity control (0-10)
- Weather effects on gameplay
- Seasonal weather patterns

### Day/Night Cycle
- Configurable day duration
- Time-of-day queries
- Sunrise/sunset events
- Moon phases (future)

### Achievement System
- Unlock achievements
- Track progress
- Query achievement status
- Cross-game achievements

### Florida-Specific Functions
- Temperature simulation
- Humidity effects
- Hurricane tracking
- Tidal patterns

## Installation

Add to your game's extensions in game.json:
```json
{
  "extensions": [
    {"name": "FloridaCore"}
  ]
}
```

## API Reference

### Weather Functions

#### `FloridaCore::SetWeather(type, intensity)`
Sets the current weather.

**Parameters:**
- `type` (string): "sunny", "rain", "thunderstorm", "hurricane"
- `intensity` (number): 0-10

**Example:**
```
Action: FloridaCore::SetWeather("rain", 5)
```

#### `FloridaCore::GetWeatherType()`
Returns the current weather type as a string.

**Example:**
```
Condition: FloridaCore::GetWeatherType() = "hurricane"
```

#### `FloridaCore::IsSunny()`
Returns true if weather is currently sunny.

### Day/Night Functions

#### `FloridaCore::StartDayNightCycle(duration)`
Starts the day/night cycle.

**Parameters:**
- `duration` (number): Seconds for a full 24-hour cycle

**Example:**
```
Action: FloridaCore::StartDayNightCycle(120) // 2 minutes per day
```

#### `FloridaCore::GetTimeOfDay()`
Returns the current time as 0-24 (hours).

#### `FloridaCore::IsNightTime()`
Returns true if between sunset and sunrise.

### Achievement Functions

#### `FloridaCore::UnlockAchievement(achievementId)`
Unlocks an achievement.

**Parameters:**
- `achievementId` (string): Unique achievement identifier

**Example:**
```
Action: FloridaCore::UnlockAchievement("first_alligator_photo")
```

#### `FloridaCore::HasAchievement(achievementId)`
Checks if achievement is unlocked.

**Example:**
```
Condition: FloridaCore::HasAchievement("everglades_complete")
```

## Version History

### 1.0.0 (Planned)
- Initial release
- Weather system
- Day/night cycle
- Achievement system
- Basic Florida environmental functions

## License

MIT
