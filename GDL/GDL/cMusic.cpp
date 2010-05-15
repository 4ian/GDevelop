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
#include "GDL/Access.h"
#include "GDL/SoundManager.h"
#include "GDL/ObjectsConcerned.h"
#include <SFML/Audio.hpp>

////////////////////////////////////////////////////////////
/// Test si une musique est entrain d'être jouée
///
/// Type : MusicPlayed
/// Paramètre 1 : Canal
////////////////////////////////////////////////////////////
bool CondMusicPlaying( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    bool Ok = false;
    bool OkContraire = false;

    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));

    if ( canal < 0 || canal > MAX_CANAUX_MUSIC )
    {
        scene.errors.Add("Canal invalide pour tester la musique", "", "", -1, 1);
        return false;
    }

    SoundManager * soundManager = SoundManager::getInstance();

    if (soundManager->GetMusicOnChannel(canal)->GetStatus() == sf::Sound::Playing)
    {
        Ok = true;
        OkContraire = false;
    }
    else
    {
        Ok = false;
        OkContraire = true;
    }

    if ( condition.IsInverted() )
        return OkContraire;

    return Ok;
}

////////////////////////////////////////////////////////////
/// Test si une musique est en pause
///
/// Type : MusicPaused
/// Paramètre 1 : Canal
////////////////////////////////////////////////////////////
bool CondMusicPaused( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    bool Ok = false;
    bool OkContraire = false;

    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));

    if ( canal < 0 || canal > MAX_CANAUX_MUSIC )
    {
        scene.errors.Add("Canal invalide pour tester la musique", "", "", -1, 1);
        return false;
    }

    SoundManager * soundManager = SoundManager::getInstance();

    if (soundManager->GetMusicOnChannel(canal)->GetStatus() == sf::Sound::Paused)
    {
        Ok = true;
        OkContraire = false;
    }
    else
    {
        Ok = false;
        OkContraire = true;
    }

    if ( condition.IsInverted() )
        return OkContraire;

    return Ok;
}

////////////////////////////////////////////////////////////
/// Test si une musique est stoppée
///
/// Type : MusicStopped
/// Paramètre 1 : Canal
////////////////////////////////////////////////////////////
bool CondMusicStopped( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    bool Ok = false;
    bool OkContraire = false;

    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));

    if ( canal < 0 || canal > MAX_CANAUX_MUSIC )
    {
        scene.errors.Add("Canal invalide pour tester la musique", "", "", -1, 1);
        return false;
    }

    SoundManager * soundManager = SoundManager::getInstance();

    if (soundManager->GetMusicOnChannel(canal)->GetStatus() == sf::Sound::Stopped)
    {
        Ok = true;
        OkContraire = false;
    }
    else
    {
        Ok = false;
        OkContraire = true;
    }

    if ( condition.IsInverted() )
        return OkContraire;

    return Ok;
}


////////////////////////////////////////////////////////////
/// Test si un son est entrain d'être joué
///
/// Type : SoundPlaying
/// Paramètre 1 : Canal
////////////////////////////////////////////////////////////
bool CondSoundPlaying( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    SoundManager * soundManager = SoundManager::getInstance();

    bool Ok = false;
    bool OkContraire = false;

    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));

    if ( canal < 0 || canal > MAX_CANAUX_SON )
    {
        scene.errors.Add("Canal invalide pour tester le son", "", "", -1, 1);
        return false;
    }

    if (soundManager->GetSoundOnChannel(canal)->GetStatus() == sf::Sound::Playing)
    {
        Ok = true;
        OkContraire = false;
    }
    else
    {
        Ok = false;
        OkContraire = true;
    }

    if ( condition.IsInverted() )
        return OkContraire;

    return Ok;
}

////////////////////////////////////////////////////////////
/// Test si un son est en pause
///
/// Type : SoundPaused
/// Paramètre 1 : Canal
////////////////////////////////////////////////////////////
bool CondSoundPaused( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    bool Ok = false;
    bool OkContraire = false;

    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));

    if ( canal < 0 || canal > MAX_CANAUX_SON )
    {
        scene.errors.Add("Canal invalide pour tester le son", "", "", -1, 1);
        return false;
    }

    SoundManager * soundManager = SoundManager::getInstance();

    if (soundManager->GetSoundOnChannel(canal)->GetStatus() == sf::Sound::Paused)
    {
        Ok = true;
        OkContraire = false;
    }
    else
    {
        Ok = false;
        OkContraire = true;
    }

    if ( condition.IsInverted() )
        return OkContraire;

    return Ok;
}


////////////////////////////////////////////////////////////
/// Test si un son est en pause
///
/// Type : SoundStopped
/// Paramètre 1 : Canal
////////////////////////////////////////////////////////////
bool CondSoundStopped( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    bool Ok = false;
    bool OkContraire = false;

    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));

    if ( canal < 0 || canal > MAX_CANAUX_SON )
    {
        scene.errors.Add("Canal invalide pour tester le son", "", "", -1, 1);
        return false;
    }

    SoundManager * soundManager = SoundManager::getInstance();

    if (soundManager->GetSoundOnChannel(canal)->GetStatus() == sf::Sound::Stopped)
    {
        Ok = true;
        OkContraire = false;
    }
    else
    {
        Ok = false;
        OkContraire = true;
    }

    if ( condition.IsInverted() )
        return OkContraire;

    return Ok;
}

////////////////////////////////////////////////////////////
/// Teste le volume global
///
/// Type : GlobalVolume
/// Paramètre 1 : Volume à tester
/// Paramètre 2 : Signe du test
////////////////////////////////////////////////////////////
bool CondGlobalVolume( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    bool Ok = false;
    bool OkContraire = false;

    SoundManager * soundManager = SoundManager::getInstance();

    float volume = soundManager->GetGlobalVolume();

    if (   (condition.GetParameter(1).GetAsCompOperator() == GDExpression::Equal && volume == condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(1).GetAsCompOperator() == GDExpression::Inferior && volume < condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(1).GetAsCompOperator() == GDExpression::Superior && volume > condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(1).GetAsCompOperator() == GDExpression::InferiorOrEqual && volume <= condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(1).GetAsCompOperator() == GDExpression::SuperiorOrEqual && volume >= condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned)))
    {
        Ok = true;
        OkContraire = false;
    }
    else
    {
        Ok = false;
        OkContraire = true;
    }

    if ( condition.IsInverted() )
        return OkContraire;

    return Ok;
}


////////////////////////////////////////////////////////////
/// Teste le volume d'un son d'un canal
///
/// Type : SoundCanalVolume
/// Paramètre 1 : Canal
/// Paramètre 2 : Volume à tester
/// Paramètre 3 : Signe du test
////////////////////////////////////////////////////////////
bool CondSoundCanalVolume( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    bool Ok = false;
    bool OkContraire = false;

    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON )
    {
        scene.errors.Add("Canal invalide pour tester le son", "", "", -1, 1);
        return false;
    }

    SoundManager * soundManager = SoundManager::getInstance();
    float volume = soundManager->GetSoundOnChannel(canal)->sound.GetVolume();

    if (   (condition.GetParameter(2).GetAsCompOperator() == GDExpression::Equal && volume == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::Inferior && volume < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::Superior && volume > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::InferiorOrEqual && volume <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::SuperiorOrEqual && volume >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned)))
    {
        Ok = true;
        OkContraire = false;
    }
    else
    {
        Ok = false;
        OkContraire = true;
    }

    if ( condition.IsInverted() )
        return OkContraire;

    return Ok;
}



////////////////////////////////////////////////////////////
/// Teste le volume d'une musique d'un canal
///
/// Type : MusicCanalVolume
/// Paramètre 1 : Canal
/// Paramètre 2 : Volume à tester
/// Paramètre 3 : Signe du test
////////////////////////////////////////////////////////////
bool CondMusicCanalVolume( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    bool Ok = false;
    bool OkContraire = false;

    int canal = static_cast<int> ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_MUSIC )
    {
        scene.errors.Add("Canal invalide pour tester la musique", "", "", -1, 1);
        return false;
    }

    SoundManager * soundManager = SoundManager::getInstance();
    float volume = soundManager->GetMusicOnChannel(canal)->music.GetVolume();

    if (   (condition.GetParameter(2).GetAsCompOperator() == GDExpression::Equal && volume == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::Inferior && volume < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::Superior && volume > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::InferiorOrEqual && volume <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned))
        || (condition.GetParameter(2).GetAsCompOperator() == GDExpression::SuperiorOrEqual && volume >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned)))
    {
        Ok = true;
        OkContraire = false;
    }
    else
    {
        Ok = false;
        OkContraire = true;
    }

    if ( condition.IsInverted() )
        return OkContraire;

    return Ok;
}
