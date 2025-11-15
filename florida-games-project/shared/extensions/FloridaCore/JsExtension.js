/**
 * FloridaCore Extension
 * Core functionality for Florida-themed games
 */

module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();

    extension
      .setExtensionInformation(
        'FloridaCore',
        'Florida Core',
        'Core extension providing weather, day/night cycle, and achievements for Florida games',
        'Florida Games Team',
        'MIT'
      )
      .setExtensionHelpPath('/docs/extensions/florida-core')
      .setCategory('Advanced');

    // Weather System Actions
    extension
      .addAction(
        'SetWeather',
        'Set weather',
        'Set the current weather type and intensity',
        'Set weather to _PARAM1_ with intensity _PARAM2_',
        'Weather',
        'res/icons/weather24.png',
        'res/icons/weather16.png'
      )
      .addParameter('string', 'Weather type', '', false)
      .addParameter('expression', 'Intensity (0-10)', '', false)
      .getCodeExtraInformation()
      .setFunctionName('setWeather')
      .setIncludeFile('shared/extensions/FloridaCore/floridacoretools.ts');

    // Weather Conditions
    extension
      .addCondition(
        'IsSunny',
        'Is sunny',
        'Check if the weather is currently sunny',
        'Weather is sunny',
        'Weather',
        'res/icons/weather24.png',
        'res/icons/weather16.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('isSunny')
      .setIncludeFile('shared/extensions/FloridaCore/floridacoretools.ts');

    // Weather Expressions
    extension
      .addStrExpression(
        'GetWeatherType',
        'Get weather type',
        'Get the current weather type',
        'Weather',
        'res/icons/weather24.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('getWeatherType')
      .setIncludeFile('shared/extensions/FloridaCore/floridacoretools.ts');

    extension
      .addExpression(
        'GetWeatherIntensity',
        'Get weather intensity',
        'Get the current weather intensity (0-10)',
        'Weather',
        'res/icons/weather24.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('getWeatherIntensity')
      .setIncludeFile('shared/extensions/FloridaCore/floridacoretools.ts');

    // Day/Night Cycle
    extension
      .addAction(
        'StartDayNightCycle',
        'Start day/night cycle',
        'Start the day/night cycle with specified duration',
        'Start day/night cycle with _PARAM1_ seconds per day',
        'Day/Night',
        'res/icons/time24.png',
        'res/icons/time16.png'
      )
      .addParameter('expression', 'Duration (seconds)', '', false)
      .getCodeExtraInformation()
      .setFunctionName('startDayNightCycle')
      .setIncludeFile('shared/extensions/FloridaCore/floridacoretools.ts');

    extension
      .addCondition(
        'IsNightTime',
        'Is night time',
        'Check if it is currently night time',
        'It is night time',
        'Day/Night',
        'res/icons/time24.png',
        'res/icons/time16.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('isNightTime')
      .setIncludeFile('shared/extensions/FloridaCore/floridacoretools.ts');

    extension
      .addExpression(
        'GetTimeOfDay',
        'Get time of day',
        'Get the current time of day (0-24 hours)',
        'Day/Night',
        'res/icons/time24.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('getTimeOfDay')
      .setIncludeFile('shared/extensions/FloridaCore/floridacoretools.ts');

    // Achievement System
    extension
      .addAction(
        'UnlockAchievement',
        'Unlock achievement',
        'Unlock a specific achievement',
        'Unlock achievement _PARAM1_',
        'Achievements',
        'res/icons/achievement24.png',
        'res/icons/achievement16.png'
      )
      .addParameter('string', 'Achievement ID', '', false)
      .getCodeExtraInformation()
      .setFunctionName('unlockAchievement')
      .setIncludeFile('shared/extensions/FloridaCore/floridacoretools.ts');

    extension
      .addCondition(
        'HasAchievement',
        'Has achievement',
        'Check if an achievement is unlocked',
        'Has achievement _PARAM1_',
        'Achievements',
        'res/icons/achievement24.png',
        'res/icons/achievement16.png'
      )
      .addParameter('string', 'Achievement ID', '', false)
      .getCodeExtraInformation()
      .setFunctionName('hasAchievement')
      .setIncludeFile('shared/extensions/FloridaCore/floridacoretools.ts');

    // Temperature/Environmental
    extension
      .addExpression(
        'GetTemperature',
        'Get temperature',
        'Get the current temperature in Fahrenheit',
        'Environment',
        'res/icons/temp24.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('getTemperature')
      .setIncludeFile('shared/extensions/FloridaCore/floridacoretools.ts');

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    return [];
  }
};
