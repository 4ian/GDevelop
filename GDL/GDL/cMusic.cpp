#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include "GDL/cMusic.h"
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include <iostream>
#include "GDL/SoundManager.h"
#include "GDL/ObjectsConcerned.h"
#include <SFML/Audio.hpp>


/**
 * Test if a music is played
 */
bool CondMusicPlaying( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_MUSIC ) return false;

    if (SoundManager::getInstance()->GetMusicOnChannel(canal)->GetStatus() == sf::Sound::Playing) return !condition.IsInverted();

    return condition.IsInverted();
}

/**
 * Test if a music is paused
 */
bool CondMusicPaused( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_MUSIC ) return false;

    if (SoundManager::getInstance()->GetMusicOnChannel(canal)->GetStatus() == sf::Sound::Paused) return !condition.IsInverted();

    return condition.IsInverted();
}

/**
 * Test if a music is stopped
 */
bool CondMusicStopped( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_MUSIC ) return false;

    if (SoundManager::getInstance()->GetMusicOnChannel(canal)->GetStatus() == sf::Sound::Stopped) return !condition.IsInverted();

    return condition.IsInverted();
}


/**
 * Test if a sound is being played
 */
bool CondSoundPlaying( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return false;

    if (SoundManager::getInstance()->GetSoundOnChannel(canal)->GetStatus() == sf::Sound::Playing) return !condition.IsInverted();

    return condition.IsInverted();
}

/**
 * Test if a sound is paused
 */
bool CondSoundPaused( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return false;

    if (SoundManager::getInstance()->GetSoundOnChannel(canal)->GetStatus() == sf::Sound::Paused) return !condition.IsInverted();

    return condition.IsInverted();
}

/**
 * Test if a sound is stopped
 */
bool CondSoundStopped( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return false;

    if (SoundManager::getInstance()->GetSoundOnChannel(canal)->GetStatus() == sf::Sound::Stopped) return !condition.IsInverted();

    return condition.IsInverted();
}

/**
 * Test global volume
 */
bool CondGlobalVolume( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    float volume = SoundManager::getInstance()->GetGlobalVolume();

    if (   (condition.GetParameter(1).GetAsCompOperator() == GDExpression::Equal && volume == condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(1).GetAsCompOperator() == GDExpression::Inferior && volume < condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(1).GetAsCompOperator() == GDExpression::Superior && volume > condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(1).GetAsCompOperator() == GDExpression::InferiorOrEqual && volume <= condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(1).GetAsCompOperator() == GDExpression::SuperiorOrEqual && volume >= condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned)))
    {
        return !condition.IsInverted();
    }

    return condition.IsInverted();
}


/**
 * Test volume of the sound of a channel
 */
bool CondSoundCanalVolume( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return false;

    float volume = SoundManager::getInstance()->GetSoundOnChannel(canal)->sound.GetVolume();

    if (   (condition.GetParameter(2).GetAsCompOperator() == GDExpression::Equal && volume == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::Inferior && volume < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::Superior && volume > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::InferiorOrEqual && volume <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::SuperiorOrEqual && volume >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned)))
    {
        return !condition.IsInverted();
    }

    return condition.IsInverted();
}

/**
 * Test volume of the music of a channel
 */
bool CondMusicCanalVolume( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_MUSIC )
        return false;

    SoundManager * soundManager = SoundManager::getInstance();
    float volume = soundManager->GetMusicOnChannel(canal)->music.GetVolume();

    if (   (condition.GetParameter(2).GetAsCompOperator() == GDExpression::Equal && volume == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::Inferior && volume < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::Superior && volume > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::InferiorOrEqual && volume <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::SuperiorOrEqual && volume >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned)))
    {
        return !condition.IsInverted();
    }

    return condition.IsInverted();
}

/**
 * Test the pitch of a music
 */
bool CondMusicChannelPitch( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_MUSIC )
        return false;

    SoundManager * soundManager = SoundManager::getInstance();
    float pitch = soundManager->GetMusicOnChannel(canal)->music.GetPitch();

    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && pitch == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && pitch < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && pitch > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && pitch <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && pitch >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && pitch != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) )
       )
    {
        return !condition.IsInverted();
    }

    return condition.IsInverted();
}

/**
 * Test the pitch of a music
 */
bool CondSoundChannelPitch( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_MUSIC )
        return false;

    SoundManager * soundManager = SoundManager::getInstance();
    float pitch = soundManager->GetSoundOnChannel(canal)->GetPitch();

    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && pitch == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && pitch < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && pitch > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && pitch <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && pitch >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && pitch != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) )
       )
    {
        return !condition.IsInverted();
    }

    return condition.IsInverted();
}
