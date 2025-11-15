/**
 * FloridaCore Extension Implementation
 * Runtime functions for weather, day/night, and achievements
 */

namespace floridagames {
  export namespace core {
    // Weather system state
    interface WeatherState {
      type: string;
      intensity: number;
      lastUpdate: number;
    }

    // Day/Night cycle state
    interface DayNightState {
      startTime: number;
      cycleDuration: number; // in seconds
      enabled: boolean;
    }

    // Achievement state
    interface AchievementState {
      unlockedAchievements: Set<string>;
    }

    // Global state storage
    const weatherState: Map<number, WeatherState> = new Map();
    const dayNightState: Map<number, DayNightState> = new Map();
    const achievementState: Map<number, AchievementState> = new Map();

    /**
     * Get or initialize weather state for a scene
     */
    function getWeatherState(runtimeScene: gdjs.RuntimeScene): WeatherState {
      const sceneId = runtimeScene.timeManager.getTimeFromStart();
      if (!weatherState.has(sceneId)) {
        weatherState.set(sceneId, {
          type: 'sunny',
          intensity: 5,
          lastUpdate: Date.now()
        });
      }
      return weatherState.get(sceneId)!;
    }

    /**
     * Set weather type and intensity
     */
    export const setWeather = (
      runtimeScene: gdjs.RuntimeScene,
      weatherType: string,
      intensity: number
    ): void => {
      const state = getWeatherState(runtimeScene);
      state.type = weatherType;
      state.intensity = Math.max(0, Math.min(10, intensity));
      state.lastUpdate = Date.now();

      // Store in scene variables for persistence
      const vars = runtimeScene.getVariables();
      vars.get('FloridaWeather').getChild('type').setString(weatherType);
      vars.get('FloridaWeather').getChild('intensity').setNumber(state.intensity);
    };

    /**
     * Check if weather is sunny
     */
    export const isSunny = (runtimeScene: gdjs.RuntimeScene): boolean => {
      const state = getWeatherState(runtimeScene);
      return state.type === 'sunny';
    };

    /**
     * Get current weather type
     */
    export const getWeatherType = (runtimeScene: gdjs.RuntimeScene): string => {
      const state = getWeatherState(runtimeScene);
      return state.type;
    };

    /**
     * Get current weather intensity
     */
    export const getWeatherIntensity = (runtimeScene: gdjs.RuntimeScene): number => {
      const state = getWeatherState(runtimeScene);
      return state.intensity;
    };

    /**
     * Start day/night cycle
     */
    export const startDayNightCycle = (
      runtimeScene: gdjs.RuntimeScene,
      duration: number
    ): void => {
      const sceneId = runtimeScene.timeManager.getTimeFromStart();
      dayNightState.set(sceneId, {
        startTime: runtimeScene.timeManager.getTimeFromStart() / 1000,
        cycleDuration: duration,
        enabled: true
      });
    };

    /**
     * Get current time of day (0-24 hours)
     */
    export const getTimeOfDay = (runtimeScene: gdjs.RuntimeScene): number => {
      const sceneId = runtimeScene.timeManager.getTimeFromStart();
      const state = dayNightState.get(sceneId);

      if (!state || !state.enabled) {
        return 12; // Default to noon
      }

      const currentTime = runtimeScene.timeManager.getTimeFromStart() / 1000;
      const elapsed = currentTime - state.startTime;
      const progress = (elapsed % state.cycleDuration) / state.cycleDuration;
      return progress * 24;
    };

    /**
     * Check if it's night time (before sunrise or after sunset)
     * Assuming sunrise at 6:00, sunset at 20:00 (Florida averages)
     */
    export const isNightTime = (runtimeScene: gdjs.RuntimeScene): boolean => {
      const time = getTimeOfDay(runtimeScene);
      return time < 6 || time >= 20;
    };

    /**
     * Get temperature based on time and weather
     * Florida temperature ranges: 60-95°F
     */
    export const getTemperature = (runtimeScene: gdjs.RuntimeScene): number => {
      const time = getTimeOfDay(runtimeScene);
      const weather = getWeatherState(runtimeScene);

      // Base temperature curve (cooler at night, warmer during day)
      const baseTemp = 75 + 15 * Math.sin(((time - 6) / 12) * Math.PI);

      // Weather modifier
      let weatherModifier = 0;
      switch (weather.type) {
        case 'rain':
          weatherModifier = -5;
          break;
        case 'thunderstorm':
          weatherModifier = -8;
          break;
        case 'hurricane':
          weatherModifier = -10;
          break;
        default:
          weatherModifier = 0;
      }

      return Math.round(baseTemp + weatherModifier);
    };

    /**
     * Get or initialize achievement state for a game
     */
    function getAchievementState(runtimeScene: gdjs.RuntimeScene): AchievementState {
      const gameId = 0; // Use game-level state
      if (!achievementState.has(gameId)) {
        achievementState.set(gameId, {
          unlockedAchievements: new Set<string>()
        });

        // Load from game variables if exists
        const gameVars = runtimeScene.getGame().getVariables();
        if (gameVars.has('FloridaAchievements')) {
          const achievementsVar = gameVars.get('FloridaAchievements');
          const children = achievementsVar.getAllChildrenArray();
          children.forEach(child => {
            if (child.getAsBoolean()) {
              achievementState.get(gameId)!.unlockedAchievements.add(child.getName());
            }
          });
        }
      }
      return achievementState.get(gameId)!;
    }

    /**
     * Unlock an achievement
     */
    export const unlockAchievement = (
      runtimeScene: gdjs.RuntimeScene,
      achievementId: string
    ): void => {
      const state = getAchievementState(runtimeScene);

      if (!state.unlockedAchievements.has(achievementId)) {
        state.unlockedAchievements.add(achievementId);

        // Save to game variables
        const gameVars = runtimeScene.getGame().getVariables();
        gameVars.get('FloridaAchievements').getChild(achievementId).setBoolean(true);

        console.log(`🏆 Achievement unlocked: ${achievementId}`);
      }
    };

    /**
     * Check if achievement is unlocked
     */
    export const hasAchievement = (
      runtimeScene: gdjs.RuntimeScene,
      achievementId: string
    ): boolean => {
      const state = getAchievementState(runtimeScene);
      return state.unlockedAchievements.has(achievementId);
    };
  }
}

// Export functions for GDevelop to use
if (typeof gdjs !== 'undefined') {
  (gdjs as any).floridagames = floridagames;
}
